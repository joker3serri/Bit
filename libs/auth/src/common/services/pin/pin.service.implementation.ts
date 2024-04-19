import { firstValueFrom } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { InternalMasterPasswordServiceAbstraction } from "@bitwarden/common/auth/abstractions/master-password.service.abstraction";
import { KdfConfig } from "@bitwarden/common/auth/models/domain/kdf-config";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { KeyGenerationService } from "@bitwarden/common/platform/abstractions/key-generation.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { KdfType } from "@bitwarden/common/platform/enums";
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
 * - TRANSIENT  : PIN is set, but does not persist through client reset.
 *                After client reset the master password is required to unlock.
 */
export type PinLockType = "DISABLED" | "PERSISTENT" | "TRANSIENT";

/**
 * Persists through a client reset. Used when require lock with MP on client restart is disabled.
 * @see SetPinComponent.setPinForm.requireMasterPasswordOnClientRestart
 */
const PIN_KEY_ENCRYPTED_USER_KEY = new UserKeyDefinition<EncryptedString>(
  PIN_DISK,
  "pinKeyEncryptedUserKey",
  {
    deserializer: (jsonValue) => jsonValue,
    clearOn: [],
  },
);

/**
 * Does NOT persist through a client reset. Used when require lock with MP on client restart is enabled.
 * @see SetPinComponent.setPinForm.requireMasterPasswordOnClientRestart
 */
const PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL = new UserKeyDefinition<EncryptedString>(
  PIN_MEMORY,
  "pinKeyEncryptedUserKeyEphemeral",
  {
    deserializer: (jsonValue) => jsonValue,
    clearOn: ["logout"],
  },
);

const PROTECTED_PIN = new UserKeyDefinition<string>(PIN_DISK, "protectedPin", {
  deserializer: (jsonValue) => jsonValue,
  clearOn: ["logout"],
});

// Formerly called `pinProtected.encrypted`
const OLD_PIN_KEY_ENCRYPTED_MASTER_KEY = new UserKeyDefinition<EncryptedString>(
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
    private keyGenerationService: KeyGenerationService,
    private logService: LogService,
    private masterPasswordService: InternalMasterPasswordServiceAbstraction,
    private stateProvider: StateProvider,
    private stateService: StateService,
  ) {}

  private async getOldPinKeyEncryptedMasterKey(): Promise<EncryptedString> {
    return await firstValueFrom(
      this.stateProvider.getActive(OLD_PIN_KEY_ENCRYPTED_MASTER_KEY).state$,
    );
  }

  async clearOldPinKeyEncryptedMasterKey(userId: UserId): Promise<void> {
    await this.stateProvider.setUserState(OLD_PIN_KEY_ENCRYPTED_MASTER_KEY, null, userId);
  }

  async getPinKeyEncryptedUserKey(userId?: UserId): Promise<EncString> {
    return EncString.fromJSON(
      await firstValueFrom(this.stateProvider.getUserState$(PIN_KEY_ENCRYPTED_USER_KEY, userId)),
    );
  }

  async setPinKeyEncryptedUserKey(value: EncString, userId?: UserId): Promise<void> {
    await this.stateProvider.setUserState(
      PIN_KEY_ENCRYPTED_USER_KEY,
      value?.encryptedString,
      userId,
    );
  }

  async getPinKeyEncryptedUserKeyEphemeral(userId?: UserId): Promise<EncString> {
    return EncString.fromJSON(
      await firstValueFrom(
        this.stateProvider.getUserState$(PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL, userId),
      ),
    );
  }

  async setPinKeyEncryptedUserKeyEphemeral(value: EncString, userId?: UserId): Promise<void> {
    await this.stateProvider.setUserState(
      PIN_KEY_ENCRYPTED_USER_KEY_EPHEMERAL,
      value?.encryptedString,
      userId,
    );
  }

  async getProtectedPin(userId?: UserId): Promise<string> {
    return await firstValueFrom(this.stateProvider.getUserState$(PROTECTED_PIN, userId));
  }

  async setProtectedPin(protectedPin: string, userId?: UserId): Promise<void> {
    await this.stateProvider.setUserState(PROTECTED_PIN, protectedPin, userId);
  }

  async storePinKeyEncryptedUserKey(userKey: UserKey, userId?: UserId) {
    userId ??= await firstValueFrom(this.stateProvider.activeUserId$);

    if (userId == null) {
      throw new Error("No UserId resolved.");
    }

    const pin = await this.encryptService.decryptToUtf8(
      new EncString(await this.getProtectedPin(userId)),
      userKey,
    );

    const pinKey = await this.makePinKey(
      pin,
      (await firstValueFrom(this.accountService.activeAccount$))?.email,
      await this.stateService.getKdfType({ userId: userId }),
      await this.stateService.getKdfConfig({ userId: userId }),
    );

    const pinKeyEncryptedUserKey = await this.encryptService.encrypt(userKey.key, pinKey);

    if ((await this.getPinKeyEncryptedUserKey(userId)) != null) {
      await this.setPinKeyEncryptedUserKey(pinKeyEncryptedUserKey, userId);
    } else {
      await this.setPinKeyEncryptedUserKeyEphemeral(pinKeyEncryptedUserKey, userId);
    }
  }

  async makePinKey(pin: string, salt: string, kdf: KdfType, kdfConfig: KdfConfig): Promise<PinKey> {
    const pinKey = await this.keyGenerationService.deriveKeyFromPassword(pin, salt, kdf, kdfConfig);
    return (await this.keyGenerationService.stretchKey(pinKey)) as PinKey;
  }

  async getPinLockType(userId?: UserId): Promise<PinLockType> {
    userId ??= await firstValueFrom(this.stateProvider.activeUserId$);

    if (userId == null) {
      throw new Error("No UserId resolved.");
    }

    // we can't check the protected pin for both because old accounts only
    // used it for MP on Restart
    const aUserKeyEncryptedPinIsSet = !!(await this.getProtectedPin(userId as UserId));
    const aPinKeyEncryptedUserKeyIsSet = !!(await this.getPinKeyEncryptedUserKey(userId as UserId));
    const anOldPinKeyEncryptedMasterKeyIsSet = !!(await this.stateService.getEncryptedPinProtected({
      userId,
    }));

    if (aPinKeyEncryptedUserKeyIsSet || anOldPinKeyEncryptedMasterKeyIsSet) {
      return "PERSISTENT";
    } else if (
      aUserKeyEncryptedPinIsSet &&
      !aPinKeyEncryptedUserKeyIsSet &&
      !anOldPinKeyEncryptedMasterKeyIsSet
    ) {
      return "TRANSIENT";
    } else {
      return "DISABLED";
    }
  }

  async isPinSet(userId?: UserId): Promise<boolean> {
    userId ??= await firstValueFrom(this.stateProvider.activeUserId$);

    if (userId == null) {
      throw new Error("No UserId resolved.");
    }

    return (await this.getPinLockType(userId)) !== "DISABLED";
  }

  async decryptUserKeyWithPin(pin: string): Promise<UserKey | null> {
    try {
      const userId = await firstValueFrom(this.stateProvider.activeUserId$);

      if (userId == null) {
        throw new Error("No UserId resolved.");
      }
      const pinLockType: PinLockType = await this.getPinLockType(userId);
      const requireMasterPasswordOnClientRestart = pinLockType === "TRANSIENT";

      const { pinKeyEncryptedUserKey, oldPinKeyEncryptedMasterKey } =
        await this.getPinKeyEncryptedKeys(pinLockType);

      const kdf: KdfType = await this.stateService.getKdfType({ userId });
      const kdfConfig: KdfConfig = await this.stateService.getKdfConfig({ userId });
      const email = (await firstValueFrom(this.accountService.activeAccount$))?.email;

      let userKey: UserKey;

      if (oldPinKeyEncryptedMasterKey) {
        userKey = await this.decryptAndMigrateOldPinKeyEncryptedMasterKey(
          requireMasterPasswordOnClientRestart,
          pin,
          email,
          kdf,
          kdfConfig,
          oldPinKeyEncryptedMasterKey,
        );
      } else {
        userKey = await this.decryptUserKey(pin, email, kdf, kdfConfig, pinKeyEncryptedUserKey);
      }

      if (!userKey) {
        this.logService.warning(`User key null after pin key decryption.`);
        return null;
      }

      if (!(await this.validatePin(userKey, pin))) {
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
   * @param pin User's PIN
   * @param salt User's salt
   * @param kdf User's KDF
   * @param kdfConfig User's KDF config
   * @param pinKeyEncryptedUserKey The UserKey, encrypted by the PinKey. If not provided it will be retrieved from storage.
   * @returns The UserKey
   */
  private async decryptUserKey(
    pin: string,
    salt: string,
    kdf: KdfType,
    kdfConfig: KdfConfig,
    pinKeyEncryptedUserKey?: EncString,
  ): Promise<UserKey> {
    const userId = await firstValueFrom(this.stateProvider.activeUserId$);

    if (userId == null) {
      throw new Error("No UserId resolved.");
    }

    pinKeyEncryptedUserKey ||= await this.getPinKeyEncryptedUserKey(userId);
    pinKeyEncryptedUserKey ||= await this.getPinKeyEncryptedUserKeyEphemeral(userId);

    if (!pinKeyEncryptedUserKey) {
      throw new Error("No PIN encrypted key found.");
    }

    const pinKey = await this.makePinKey(pin, salt, kdf, kdfConfig);
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
   *
   * @param requireMasterPasswordOnClientRestart Whether or not the master password is required on client restart
   * @param pin User's PIN
   * @param email User's email
   * @param kdf User's KdfType
   * @param kdfConfig User's KdfConfig
   * @param oldPinKeyEncryptedMasterKey The Master Key, encrypted by the PinKey (legacy)
   * @returns The UserKey
   */
  private async decryptAndMigrateOldPinKeyEncryptedMasterKey(
    requireMasterPasswordOnClientRestart: boolean,
    pin: string,
    email: string,
    kdf: KdfType,
    kdfConfig: KdfConfig,
    oldPinKeyEncryptedMasterKey: EncString,
  ): Promise<UserKey> {
    // Decrypt
    const masterKey = await this.decryptMasterKeyWithPin(
      pin,
      email,
      kdf,
      kdfConfig,
      oldPinKeyEncryptedMasterKey,
    );

    const encUserKey = await this.stateService.getEncryptedCryptoSymmetricKey();
    const userKey = await this.masterPasswordService.decryptUserKeyWithMasterKey(
      masterKey,
      new EncString(encUserKey),
    );

    // Migrate
    const pinKey = await this.makePinKey(pin, email, kdf, kdfConfig);
    const pinKeyEncryptedUserKey = await this.encryptService.encrypt(userKey.key, pinKey);

    // Clear oldPinKeyEncryptedMasterKey and set new pinKeyEncryptedUserKey
    if (requireMasterPasswordOnClientRestart) {
      await this.stateService.setDecryptedPinProtected(null); // Clears oldPinKeyEncryptedMasterKey
      await this.setPinKeyEncryptedUserKeyEphemeral(pinKeyEncryptedUserKey);
    } else {
      await this.stateService.setEncryptedPinProtected(null); // Clears oldPinKeyEncryptedMasterKey
      await this.setPinKeyEncryptedUserKey(pinKeyEncryptedUserKey);

      // We previously only set the protected pin if MP on Restart was enabled
      // now we set it regardless
      // TODO-rr-bw: based on this comment, shouldn't this code be placed outside the if/else block?
      const userKeyEncryptedPin = await this.encryptService.encrypt(pin, userKey);
      await this.setProtectedPin(userKeyEncryptedPin.encryptedString);
    }

    // This also clears the old Biometrics key since the new Biometrics key will
    // be created when the user key is set.
    await this.stateService.setCryptoMasterKeyBiometric(null);

    return userKey;
  }

  // Only for migration purposes
  private async decryptMasterKeyWithPin(
    pin: string,
    salt: string,
    kdf: KdfType,
    kdfConfig: KdfConfig,
    oldPinKeyEncryptedMasterKey?: EncString,
  ): Promise<MasterKey> {
    if (!oldPinKeyEncryptedMasterKey) {
      const oldPinKeyEncryptedMasterKeyString = await this.stateService.getEncryptedPinProtected();

      if (oldPinKeyEncryptedMasterKeyString == null) {
        throw new Error("No PIN encrypted key found.");
      }

      oldPinKeyEncryptedMasterKey = new EncString(oldPinKeyEncryptedMasterKeyString);
    }

    const pinKey = await this.makePinKey(pin, salt, kdf, kdfConfig);
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
    userId?: UserId,
  ): Promise<{ pinKeyEncryptedUserKey: EncString; oldPinKeyEncryptedMasterKey?: EncString }> {
    userId ??= await firstValueFrom(this.stateProvider.activeUserId$);

    if (userId == null) {
      throw new Error("No UserId resolved.");
    }

    switch (pinLockType) {
      case "PERSISTENT": {
        const pinKeyEncryptedUserKey = await this.getPinKeyEncryptedUserKey(userId);
        const oldPinKeyEncryptedMasterKey = await this.stateService.getEncryptedPinProtected({
          userId,
        });

        return {
          pinKeyEncryptedUserKey,
          oldPinKeyEncryptedMasterKey: oldPinKeyEncryptedMasterKey
            ? new EncString(oldPinKeyEncryptedMasterKey)
            : undefined,
        };
      }
      case "TRANSIENT": {
        const pinKeyEncryptedUserKey = await this.getPinKeyEncryptedUserKeyEphemeral(userId);
        const oldPinKeyEncryptedMasterKey = await this.stateService.getDecryptedPinProtected({
          userId,
        });

        return { pinKeyEncryptedUserKey, oldPinKeyEncryptedMasterKey };
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

  private async validatePin(userKey: UserKey, pin: string): Promise<boolean> {
    const protectedPin = await this.getProtectedPin();
    const decryptedPin = await this.encryptService.decryptToUtf8(
      new EncString(protectedPin),
      userKey,
    );

    return decryptedPin === pin;
  }
}
