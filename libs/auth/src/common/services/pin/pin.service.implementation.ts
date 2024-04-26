import { firstValueFrom } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { KdfConfigService } from "@bitwarden/common/auth/abstractions/kdf-config.service";
import { InternalMasterPasswordServiceAbstraction } from "@bitwarden/common/auth/abstractions/master-password.service.abstraction";
import { KdfConfig } from "@bitwarden/common/auth/models/domain/kdf-config";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { KeyGenerationService } from "@bitwarden/common/platform/abstractions/key-generation.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { EncString, EncryptedString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import {
  PIN_DISK,
  PIN_MEMORY,
  StateProvider,
  UserKeyDefinition,
} from "@bitwarden/common/platform/state";
import { UserId } from "@bitwarden/common/types/guid";
import { MasterKey, PinKey, UserKey } from "@bitwarden/common/types/key";

import { PinServiceAbstraction } from "../../abstractions/pin.service.abstraction";

/**
 * - DISABLED   : No PIN set.
 * - PERSISTENT : PIN is set and persists through client reset.
 * - EPHEMERAL  : PIN is set, but does not persist through client reset.
 *                After client reset the master password is required to unlock.
 */
export type PinLockType = "DISABLED" | "PERSISTENT" | "EPHEMERAL";

/**
 * Persists through a client reset. Used when require lock with MP on client restart is disabled.
 * @see SetPinComponent.setPinForm.requireMasterPasswordOnClientRestart
 */
export const PIN_KEY_ENCRYPTED_USER_KEY = new UserKeyDefinition<EncryptedString>(
  PIN_DISK,
  "pinKeyEncryptedUserKey",
  {
    deserializer: (jsonValue) => jsonValue,
    clearOn: ["logout"],
  },
);

/**
 * Does NOT persist through a client reset. Used when require lock with MP on client restart is enabled.
 * @see SetPinComponent.setPinForm.requireMasterPasswordOnClientRestart
 */
export const PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL = new UserKeyDefinition<EncryptedString>(
  PIN_MEMORY,
  "pinKeyEncryptedUserKeyEphemeral",
  {
    deserializer: (jsonValue) => jsonValue,
    clearOn: ["logout"],
  },
);

export const PROTECTED_PIN = new UserKeyDefinition<string>(PIN_DISK, "protectedPin", {
  deserializer: (jsonValue) => jsonValue,
  clearOn: ["logout"],
});

/**
 * The old MasterKey, encrypted by the PinKey (formerly called `pinProtected`),
 * which is now deprecated and used for migration purposes only.
 *
 * We now use the `pinKeyEncryptedUserKey`.
 */
export const OLD_PIN_KEY_ENCRYPTED_MASTER_KEY = new UserKeyDefinition<EncryptedString>(
  PIN_DISK,
  "oldPinKeyEncryptedMasterKey",
  {
    deserializer: (jsonValue) => jsonValue,
    clearOn: ["logout"],
  },
);

export class PinService implements PinServiceAbstraction {
  constructor(
    private accountService: AccountService,
    private encryptService: EncryptService,
    private kdfConfigService: KdfConfigService,
    private keyGenerationService: KeyGenerationService,
    private logService: LogService,
    private masterPasswordService: InternalMasterPasswordServiceAbstraction,
    private stateProvider: StateProvider,
    private stateService: StateService,
  ) {}

  async getPinKeyEncryptedUserKey(userId: UserId): Promise<EncString> {
    this.validateUserId(userId, "Cannot get pinKeyEncryptedUserKey.");

    return EncString.fromJSON(
      await firstValueFrom(this.stateProvider.getUserState$(PIN_KEY_ENCRYPTED_USER_KEY, userId)),
    );
  }

  /**
   * Sets the UserKey, encrypted by the PinKey.
   */
  private async setPinKeyEncryptedUserKey(encString: EncString, userId: UserId): Promise<void> {
    this.validateUserId(userId, "Cannot set pinKeyEncryptedUserKey.");

    await this.stateProvider.setUserState(
      PIN_KEY_ENCRYPTED_USER_KEY,
      encString?.encryptedString,
      userId,
    );
  }

  async clearPinKeyEncryptedUserKey(userId: UserId): Promise<void> {
    this.validateUserId(userId, "Cannot clear pinKeyEncryptedUserKey.");

    await this.stateProvider.setUserState(PIN_KEY_ENCRYPTED_USER_KEY, null, userId);
  }

  async getPinKeyEncryptedUserKeyEphemeral(userId: UserId): Promise<EncString> {
    this.validateUserId(userId, "Cannot get pinKeyEncryptedUserKeyEphemeral.");

    return EncString.fromJSON(
      await firstValueFrom(
        this.stateProvider.getUserState$(PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL, userId),
      ),
    );
  }

  /**
   * Sets the ephemeral (stored in memory) version of the UserKey, encrypted by the PinKey.
   */
  private async setPinKeyEncryptedUserKeyEphemeral(
    encString: EncString,
    userId: UserId,
  ): Promise<void> {
    this.validateUserId(userId, "Cannot set pinKeyEncryptedUserKeyEphemeral.");

    await this.stateProvider.setUserState(
      PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL,
      encString?.encryptedString,
      userId,
    );
  }

  async clearPinKeyEncryptedUserKeyEphemeral(userId: UserId): Promise<void> {
    this.validateUserId(userId, "Cannot clear pinKeyEncryptedUserKeyEphemeral.");

    await this.stateProvider.setUserState(PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL, null, userId);
  }

  async storePinKeyEncryptedUserKey(
    pinKeyEncryptedUserKey: EncString,
    storeAsEphemeral: boolean,
    userId: UserId,
  ) {
    this.validateUserId(userId, "Cannot store pinKeyEncryptedUserKey.");

    if (storeAsEphemeral) {
      await this.setPinKeyEncryptedUserKeyEphemeral(pinKeyEncryptedUserKey, userId);
    } else {
      await this.setPinKeyEncryptedUserKey(pinKeyEncryptedUserKey, userId);
    }
  }

  async getProtectedPin(userId: UserId): Promise<string> {
    this.validateUserId(userId, "Cannot get protectedPin.");

    return await firstValueFrom(this.stateProvider.getUserState$(PROTECTED_PIN, userId));
  }

  async setProtectedPin(protectedPin: string, userId: UserId): Promise<void> {
    this.validateUserId(userId, "Cannot set protectedPin.");

    await this.stateProvider.setUserState(PROTECTED_PIN, protectedPin, userId);
  }

  async getOldPinKeyEncryptedMasterKey(userId: UserId): Promise<EncryptedString> {
    this.validateUserId(userId, "Cannot get oldPinKeyEncryptedMasterKey.");

    return await firstValueFrom(
      this.stateProvider.getUserState$(OLD_PIN_KEY_ENCRYPTED_MASTER_KEY, userId),
    );
  }

  async clearOldPinKeyEncryptedMasterKey(userId: UserId): Promise<void> {
    this.validateUserId(userId, "Cannot clear oldPinKeyEncryptedMasterKey.");

    await this.stateProvider.setUserState(OLD_PIN_KEY_ENCRYPTED_MASTER_KEY, null, userId);
  }

  async createPinKeyEncryptedUserKey(
    pin: string,
    userKey: UserKey,
    userId: UserId,
  ): Promise<EncString> {
    this.validateUserId(userId, "Cannot create pinKeyEncryptedUserKey.");

    if (!userKey) {
      throw new Error("No UserKey provided. Cannot create pinKeyEncryptedUserKey.");
    }

    const pinKey = await this.makePinKey(
      pin,
      (await firstValueFrom(this.accountService.activeAccount$))?.email,
      await this.kdfConfigService.getKdfConfig(),
    );

    return await this.encryptService.encrypt(userKey.key, pinKey);
  }

  async createProtectedPin(pin: string, userKey: UserKey) {
    if (!userKey) {
      throw new Error("No UserKey provided. Cannot create protectedPin.");
    }
    return await this.encryptService.encrypt(pin, userKey);
  }

  async makePinKey(pin: string, salt: string, kdfConfig: KdfConfig): Promise<PinKey> {
    const pinKey = await this.keyGenerationService.deriveKeyFromPassword(pin, salt, kdfConfig);
    return (await this.keyGenerationService.stretchKey(pinKey)) as PinKey;
  }

  async getPinLockType(userId: UserId): Promise<PinLockType> {
    this.validateUserId(userId, "Cannot get PinLockType.");

    // we can't check the protected pin for both because old accounts only
    // used it for MP on Restart
    const aProtectedPinIsSet = !!(await this.getProtectedPin(userId));
    const aPinKeyEncryptedUserKeyIsSet = !!(await this.getPinKeyEncryptedUserKey(userId));
    const anOldPinKeyEncryptedMasterKeyIsSet =
      !!(await this.getOldPinKeyEncryptedMasterKey(userId));

    if (aPinKeyEncryptedUserKeyIsSet || anOldPinKeyEncryptedMasterKeyIsSet) {
      return "PERSISTENT";
    } else if (
      aProtectedPinIsSet &&
      !aPinKeyEncryptedUserKeyIsSet &&
      !anOldPinKeyEncryptedMasterKeyIsSet
    ) {
      return "EPHEMERAL";
    } else {
      return "DISABLED";
    }
  }

  async isPinSet(userId: UserId): Promise<boolean> {
    this.validateUserId(userId, "Cannot determine if PIN is set.");

    return (await this.getPinLockType(userId)) !== "DISABLED";
  }

  async decryptUserKeyWithPin(pin: string, userId: UserId): Promise<UserKey | null> {
    this.validateUserId(userId, "Cannot decrypt user key with PIN.");

    try {
      const pinLockType: PinLockType = await this.getPinLockType(userId);
      const requireMasterPasswordOnClientRestart = pinLockType === "EPHEMERAL";

      const { pinKeyEncryptedUserKey, oldPinKeyEncryptedMasterKey } =
        await this.getPinKeyEncryptedKeys(pinLockType, userId);

      const kdfConfig: KdfConfig = await this.kdfConfigService.getKdfConfig();
      const email = (await firstValueFrom(this.accountService.activeAccount$))?.email;

      let userKey: UserKey;

      if (oldPinKeyEncryptedMasterKey) {
        userKey = await this.decryptAndMigrateOldPinKeyEncryptedMasterKey(
          userId,
          pin,
          email,
          kdfConfig,
          requireMasterPasswordOnClientRestart,
          oldPinKeyEncryptedMasterKey,
        );
      } else {
        userKey = await this.decryptUserKey(userId, pin, email, kdfConfig, pinKeyEncryptedUserKey);
      }

      if (!userKey) {
        this.logService.warning(`User key null after pin key decryption.`);
        return null;
      }

      if (!(await this.validatePin(userKey, pin, userId))) {
        this.logService.warning(`Pin key decryption successful but pin validation failed.`);
        return null;
      }

      return userKey;
    } catch (error) {
      this.logService.error(`Error decrypting user key with pin: ${error}`);
      return null;
    }
  }

  /**
   * Decrypts the UserKey with the provided PIN
   */
  private async decryptUserKey(
    userId: UserId,
    pin: string,
    salt: string,
    kdfConfig: KdfConfig,
    pinKeyEncryptedUserKey?: EncString,
  ): Promise<UserKey> {
    this.validateUserId(userId, "Cannot decrypt user key.");

    pinKeyEncryptedUserKey ||= await this.getPinKeyEncryptedUserKey(userId);
    pinKeyEncryptedUserKey ||= await this.getPinKeyEncryptedUserKeyEphemeral(userId);

    if (!pinKeyEncryptedUserKey) {
      throw new Error("No pinKeyEncryptedUserKey found.");
    }

    const pinKey = await this.makePinKey(pin, salt, kdfConfig);
    const userKey = await this.encryptService.decryptToBytes(pinKeyEncryptedUserKey, pinKey);

    return new SymmetricCryptoKey(userKey) as UserKey;
  }

  /**
   * @summary Creates a new PinKey that encrypts the UserKey instead of encrypting the MasterKey. Clears the `oldPinKeyEncryptedMasterKey` (aka `pinProtected`) from state.
   *
   * @description
   * - Decrypts the `oldPinKeyEncryptedMasterKey` with the entered PIN, resulting in a master key
   * - Uses that master key to decrypt the user key
   * - Creates a new PinKey and uses it to encrypt the user key, resulting in a new `pinKeyEncryptedUserKey`
   * - Clears the `oldPinKeyEncryptedMasterKey` (aka `pinProtected`) from state
   * - Sets the new `pinKeyEncryptedUserKey` to state (either persistent or ephemeral depending on `requireMasterPasswordOnClientRestart`)
   * - Creates a new `protectedPin` by encrypting the PIN with the user key
   * - Sets that new `protectedPin` to state
   * @returns UserKey
   */
  private async decryptAndMigrateOldPinKeyEncryptedMasterKey(
    userId: UserId,
    pin: string,
    email: string,
    kdfConfig: KdfConfig,
    requireMasterPasswordOnClientRestart: boolean,
    oldPinKeyEncryptedMasterKey: EncString,
  ): Promise<UserKey> {
    this.validateUserId(userId, "Cannot decrypt and migrate oldPinKeyEncryptedMasterKey.");

    const masterKey = await this.decryptMasterKeyWithPin(
      userId,
      pin,
      email,
      kdfConfig,
      oldPinKeyEncryptedMasterKey,
    );

    const encUserKey = await this.stateService.getEncryptedCryptoSymmetricKey();
    const userKey = await this.masterPasswordService.decryptUserKeyWithMasterKey(
      masterKey,
      new EncString(encUserKey),
    );

    const pinKeyEncryptedUserKey = await this.createPinKeyEncryptedUserKey(pin, userKey, userId);
    await this.storePinKeyEncryptedUserKey(
      pinKeyEncryptedUserKey,
      requireMasterPasswordOnClientRestart,
      userId,
    );

    const protectedPin = await this.createProtectedPin(pin, userKey);
    await this.setProtectedPin(protectedPin.encryptedString, userId);

    await this.clearOldPinKeyEncryptedMasterKey(userId);

    // This also clears the old Biometrics key since the new Biometrics key will
    // be created when the user key is set.
    await this.stateService.setCryptoMasterKeyBiometric(null);

    return userKey;
  }

  // Only for migration purposes
  private async decryptMasterKeyWithPin(
    userId: UserId,
    pin: string,
    salt: string,
    kdfConfig: KdfConfig,
    oldPinKeyEncryptedMasterKey?: EncString,
  ): Promise<MasterKey> {
    this.validateUserId(userId, "Cannot decrypt master key with PIN.");

    if (!oldPinKeyEncryptedMasterKey) {
      const oldPinKeyEncryptedMasterKeyString = await this.getOldPinKeyEncryptedMasterKey(userId);

      if (oldPinKeyEncryptedMasterKeyString == null) {
        throw new Error("No oldPinKeyEncrytedMasterKey found.");
      }

      oldPinKeyEncryptedMasterKey = new EncString(oldPinKeyEncryptedMasterKeyString);
    }

    const pinKey = await this.makePinKey(pin, salt, kdfConfig);
    const masterKey = await this.encryptService.decryptToBytes(oldPinKeyEncryptedMasterKey, pinKey);

    return new SymmetricCryptoKey(masterKey) as MasterKey;
  }

  /**
   * Gets the user's `pinKeyEncryptedUserKey` and `oldPinKeyEncryptedMasterKey` (if one exists) based
   * on the user's PinLockType.
   * @remarks The `oldPinKeyEncryptedMasterKey` (also known as `pinProtected`) is only used for
   *          migrating old PinKeys and will be null for all migrated accounts
   * @throws If PinLockType is 'DISABLED'
   */
  private async getPinKeyEncryptedKeys(
    pinLockType: PinLockType,
    userId: UserId,
  ): Promise<{ pinKeyEncryptedUserKey: EncString; oldPinKeyEncryptedMasterKey?: EncString }> {
    this.validateUserId(userId, "Cannot get PinKey encrypted keys.");

    switch (pinLockType) {
      case "PERSISTENT": {
        const pinKeyEncryptedUserKey = await this.getPinKeyEncryptedUserKey(userId);
        const oldPinKeyEncryptedMasterKey = await this.getOldPinKeyEncryptedMasterKey(userId);

        return {
          pinKeyEncryptedUserKey,
          oldPinKeyEncryptedMasterKey: oldPinKeyEncryptedMasterKey
            ? new EncString(oldPinKeyEncryptedMasterKey)
            : undefined,
        };
      }
      case "EPHEMERAL": {
        const pinKeyEncryptedUserKey = await this.getPinKeyEncryptedUserKeyEphemeral(userId);
        const oldPinKeyEncryptedMasterKey = await this.getOldPinKeyEncryptedMasterKey(userId);

        return {
          pinKeyEncryptedUserKey,
          oldPinKeyEncryptedMasterKey: oldPinKeyEncryptedMasterKey
            ? new EncString(oldPinKeyEncryptedMasterKey)
            : undefined,
        };
      }
      case "DISABLED":
        throw new Error("Pin is disabled");
      default: {
        // Compile-time check for exhaustive switch
        const _exhaustiveCheck: never = pinLockType;
        return _exhaustiveCheck;
      }
    }
  }

  private async validatePin(userKey: UserKey, pin: string, userId: UserId): Promise<boolean> {
    this.validateUserId(userId, "Cannot validate PIN.");

    const protectedPin = await this.getProtectedPin(userId);
    const decryptedPin = await this.encryptService.decryptToUtf8(
      new EncString(protectedPin),
      userKey,
    );

    return decryptedPin === pin;
  }

  /**
   * Throws a custom error message if user ID is not provided.
   */
  private validateUserId(userId: UserId, errorMessage: string = "") {
    if (!userId) {
      throw new Error(`User ID is required. ${errorMessage}`);
    }
  }
}
