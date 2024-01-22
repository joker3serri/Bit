import { KeySuffixOptions } from "@bitwarden/common/platform/enums";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  SymmetricCryptoKey,
  UserKey,
} from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { CryptoService } from "@bitwarden/common/platform/services/crypto.service";
import { UserId } from "@bitwarden/common/types/guid";

export class BrowserCryptoService extends CryptoService {
  override async hasUserKeyStored(keySuffix: KeySuffixOptions, userId?: UserId): Promise<boolean> {
    if (keySuffix === KeySuffixOptions.Biometric) {
      return await this.stateService.getBiometricUnlock({ userId: userId });
    }
    return super.hasUserKeyStored(keySuffix, userId);
  }

  /**
   * Browser doesn't store biometric keys, so we retrieve them from the desktop and return
   * if we successfully saved it into memory as the User Key
   */
  protected override async getKeyFromStorage(
    keySuffix: KeySuffixOptions,
    userId?: UserId,
  ): Promise<UserKey> {
    if (keySuffix === KeySuffixOptions.Biometric) {
      const result = await this.platformUtilService.authenticateBiometric();

      // return null for user key if the user fails or cancels the biometrics prompt.
      // Otherwise, if there is a user key in memory after unlock, biometrics user verification
      // will always just return the user key from state regardless of if the user has successfully passed the biometrics prompt or not.
      if (!result) {
        return null;
      }

      const userKey = await this.stateService.getUserKey({ userId: userId });
      if (userKey) {
        return new SymmetricCryptoKey(Utils.fromB64ToArray(userKey.keyB64)) as UserKey;
      }
    }

    return await super.getKeyFromStorage(keySuffix, userId);
  }
}
