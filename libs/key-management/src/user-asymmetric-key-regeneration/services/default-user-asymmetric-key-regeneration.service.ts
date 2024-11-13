import { firstValueFrom, map } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { SdkService } from "@bitwarden/common/platform/abstractions/sdk/sdk.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
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
    protected userAsymmetricKeysRegenerationApiService: UserAsymmetricKeysRegenerationApiService,
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
      this.sdkService.client$.pipe(
        map((sdk) =>
          sdk.crypto().verify_asymmetric_keys({
            userKey: userKey.keyB64,
            userPublicKey: publicKeyResponse.publicKey,
            userKeyEncryptedPrivateKey: userKeyEncryptedPrivateKey,
          }),
        ),
      ),
    );

    if (verificationResponse.privateKeyDecryptable) {
      if (verificationResponse.validPrivateKey) {
        // The private key is decryptable and valid. Should not regenerate.
        return false;
      } else {
        // The private key is decryptable but not valid so we should regenerate it.
        return true;
      }
    }

    // The private isn't decryptable, check to see if we can decrypt something with the userKey.
    const userKeyCanDecrypt = await this.userKeyCanDecrypt(userKey);
    if (userKeyCanDecrypt) {
      return true;
    }

    this.logService.warning(
      "[UserAsymmetricKeyRegeneration] User Asymmetric Key decryption failure detected, but unable to determine User Symmetric Key validity.",
    );
    return false;
  }

  private async regenerateUserAsymmetricKeys(userId: UserId): Promise<void> {
    const userKey = await firstValueFrom(this.keyService.userKey$(userId));
    const makeKeyPairResponse = await firstValueFrom(
      this.sdkService.client$.pipe(map((sdk) => sdk.crypto().make_key_pair(userKey.keyB64))),
    );

    try {
      await this.userAsymmetricKeysRegenerationApiService.regenerateUserAsymmetricKeys(
        makeKeyPairResponse.userPublicKey,
        new EncString(makeKeyPairResponse.userKeyEncryptedPrivateKey),
      );
    } catch (error) {
      if (error.message === "Key regeneration not supported for this user.") {
        this.logService.info(
          "[UserAsymmetricKeyRegeneration] User Key regeneration not supported for this user at this time.",
        );
      } else {
        this.logService.error(
          "[UserAsymmetricKeyRegeneration] User Key regeneration error when submitting the request to the server: " +
            error,
        );
      }
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
