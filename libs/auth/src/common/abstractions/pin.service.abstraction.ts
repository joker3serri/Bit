import { KdfConfig } from "@bitwarden/common/auth/models/domain/kdf-config";
import { KdfType } from "@bitwarden/common/platform/enums";
import { EncString, EncryptedString } from "@bitwarden/common/platform/models/domain/enc-string";
import { UserId } from "@bitwarden/common/types/guid";
import { PinKey, UserKey } from "@bitwarden/common/types/key";

import { PinLockType } from "../services";

export abstract class PinServiceAbstraction {
  /**
   * Gets the UserKey, encrypted by the PinKey.
   */
  abstract getPinKeyEncryptedUserKey: (userId: UserId) => Promise<EncString>;

  /**
   * Sets the UserKey, encrypted by the PinKey.
   */
  abstract setPinKeyEncryptedUserKey: (encString: EncString, userId: UserId) => Promise<void>;

  /**
   * Clears the UserKey, encrypted by the PinKey
   */
  abstract clearPinKeyEncryptedUserKey(userId: UserId): Promise<void>;

  /**
   * Gets the ephemeral (stored in memory) version of the UserKey, encrypted by the PinKey.
   */
  abstract getPinKeyEncryptedUserKeyEphemeral: (userId: UserId) => Promise<EncString>;

  /**
   * Sets the ephemeral (stored in memory) version of the UserKey, encrypted by the PinKey.
   */
  abstract setPinKeyEncryptedUserKeyEphemeral: (
    encString: EncString,
    userId: UserId,
  ) => Promise<void>;

  /**
   * Clears the ephemeral (stored in memory) version of the UserKey, encrypted by the PinKey
   */
  abstract clearPinKeyEncryptedUserKeyEphemeral(userId: UserId): Promise<void>;

  /**
   * Gets the user's PIN, encrypted by the UserKey.
   */
  abstract getProtectedPin: (userId: UserId) => Promise<string>;

  /**
   * Sets the user's PIN, encrypted by the UserKey.
   */
  abstract setProtectedPin: (protectedPin: string, userId: UserId) => Promise<void>;

  /**
   * Stores the UserKey, encrypted by the PinKey.
   * - If require MP on client reset is disabled, stores the persistent version via {@link setPinKeyEncryptedUserKey}
   * - If require MP on client reset is enabled, stores the ephemeral version via {@link setPinKeyEncryptedUserKeyEphemeral}
   * TODO-rr-bw: rename method? the name is very similar to getPinKeyEncryptedUserKey(), which only stores the persistent version
   * TODO-rr-bw: OR consider moving back to CryptoService within the storeAdditionalKeys() method since it is only used there once
   */
  abstract storePinKeyEncryptedUserKey: (userKey: UserKey, userId: UserId) => Promise<void>;

  /**
   * Gets the old MasterKey, encrypted by the PinKey (formerly called `pinProtected`),
   * which is now deprecated and used for migration purposes only.
   */
  abstract getOldPinKeyEncryptedMasterKey: (userId: UserId) => Promise<EncryptedString>;

  /**
   * Clears the old MasterKey, encrypted by the PinKey.
   */
  abstract clearOldPinKeyEncryptedMasterKey: (userId: UserId) => Promise<void>;

  /**
   * Makes a PinKey from the provided PIN.
   */
  abstract makePinKey: (
    pin: string,
    salt: string,
    kdf: KdfType,
    kdfConfig: KdfConfig,
  ) => Promise<PinKey>;

  /**
   * Gets the user's PinLockType {@link PinLockType}.
   * @param userId The user id to check. If not provided, the current user is used
   */
  abstract getPinLockType: (userId: UserId) => Promise<PinLockType>;

  /**
   * Declares whether or not the user has a PIN set (either persistent or ephemeral).
   * @param userId The user id to check. If not provided, the current user is used
   */
  abstract isPinSet: (userId: UserId) => Promise<boolean>;

  /**
   * Decrypts the UserKey with the provided PIN.
   *
   * @remarks If the user has an old pinKeyEncryptedMasterKey (formerly called `pinProtected`), the UserKey
   * will be obtained via the private {@link  decryptAndMigrateOldPinKeyEncryptedMasterKey} method.
   * If the user does not have an old pinKeyEncryptedMasterKey, the UserKey will be obtained via the
   * private {@link decryptUserKey} method.
   *
   * @returns UserKey
   */
  abstract decryptUserKeyWithPin: (pin: string, userId: UserId) => Promise<UserKey | null>;
}
