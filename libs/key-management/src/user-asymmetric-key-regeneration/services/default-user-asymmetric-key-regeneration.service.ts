import { firstValueFrom, map } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { SdkService } from "@bitwarden/common/platform/abstractions/sdk/sdk.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { StateProvider } from "@bitwarden/common/platform/state";
import { UserId } from "@bitwarden/common/types/guid";
import { UserKey } from "@bitwarden/common/types/key";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

import { KeyService } from "../../abstractions/key.service";
import { UserAsymmetricKeysRegenerationApiService } from "../abstractions/user-asymmetric-key-regeneration-api.service";
import { UserAsymmetricKeysRegenerationService } from "../abstractions/user-asymmetric-key-regeneration.service";

export class DefaultUserAsymmetricKeysRegenerationService
  implements UserAsymmetricKeysRegenerationService
{
  constructor(
    protected keyService: KeyService,
    protected cipherService: CipherService,
    protected regenerateUserAsymmetricKeysApiService: UserAsymmetricKeysRegenerationApiService,
    protected stateProvider: StateProvider,
    protected logService: LogService,
    protected sdkService: SdkService,
    protected apiService: ApiService,
    protected configService: ConfigService,
  ) {}

  async handleUserAsymmetricKeysRegeneration(userId: UserId): Promise<void> {
    try {
      const privateKeyRegenerationFlag = await this.configService.getFeatureFlag(
        FeatureFlag.PrivateKeyRegeneration,
      );

      if (privateKeyRegenerationFlag) {
        const shouldRegenerate = await this.shouldRegenerate(userId);
        if (shouldRegenerate) {
          await this.regenerateUserAsymmetricKeys(userId);
        }
      }
    } catch (error) {
      this.logService.error(
        "[UserAsymmetricKeyRegeneration] User Key regeneration error: " +
          error +
          " Skipping regeneration for the user.",
      );
    }
  }

  private async shouldRegenerate(userId: UserId): Promise<boolean> {
    const [userKey, userKeyEncryptedPrivateKey, publicKeyResponse] = await Promise.all([
      firstValueFrom(this.keyService.userKey$(userId)),
      firstValueFrom(this.keyService.userEncryptedPrivateKey$(userId)),
      this.apiService.getUserPublicKey(userId),
    ]);

    const verificationResponse = await firstValueFrom(
      this.sdkService.userClient$(userId).pipe(
        map((sdk) =>
          sdk.crypto().verify_asymmetric_keys({
            userPublicKey: publicKeyResponse.publicKey,
            userKeyEncryptedPrivateKey: userKeyEncryptedPrivateKey,
          }),
        ),
      ),
    );

    if (verificationResponse.privateKeyDecryptable && verificationResponse.validPrivateKey) {
      // Private key is decryptable and valid. Should not regenerate.
      return false;
    }

    if (!verificationResponse.privateKeyDecryptable) {
      // Check to see if we can decrypt something with the userKey.
      // If we can decrypt something with the userKey then return true.
      const userKeyCanDecrypt = await this.userKeyCanDecrypt(userKey);
      if (userKeyCanDecrypt) {
        return true;
      }

      this.logService.warning(
        "[UserAsymmetricKeyRegeneration] User Asymmetric Key decryption failure detected, but unable to determine User Symmetric Key validity.",
      );
      return false;
    }

    if (verificationResponse.privateKeyDecryptable && !verificationResponse.validPrivateKey) {
      // The private key is decryptable but not valid so we should regenerate it.
      return true;
    }

    return false;
  }

  private async regenerateUserAsymmetricKeys(userId: UserId): Promise<void> {
    const makeKeyPairResponse = await firstValueFrom(
      this.sdkService.userClient$(userId).pipe(map((sdk) => sdk.crypto().make_key_pair())),
    );

    try {
      await this.regenerateUserAsymmetricKeysApiService.regenerateUserAsymmetricKeys(
        makeKeyPairResponse.userPublicKey,
        new EncString(makeKeyPairResponse.userKeyEncryptedPrivateKey),
      );
    } catch (error) {
      this.logService.error(
        "[UserAsymmetricKeyRegeneration] User Key regeneration error when submitting the request to the server: " +
          error,
      );
      return;
    }

    await this.keyService.setPrivateKey(makeKeyPairResponse.userKeyEncryptedPrivateKey, userId);
  }

  private async userKeyCanDecrypt(userKey: UserKey): Promise<boolean> {
    const ciphers = await this.cipherService.getAll();
    const cipher = ciphers.find((cipher) => cipher.organizationId == null);

    if (cipher != null) {
      try {
        await cipher.decrypt(userKey);
        return true;
      } catch (error) {
        this.logService.error(
          "[UserAsymmetricKeyRegeneration] User Key decryption error: " + error,
        );
        return false;
      }
    }
    return false;
  }
}
