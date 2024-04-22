import { KeyDefinitionLike, MigrationHelper, StateDefinitionLike } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedAccountState = {
  settings?: {
    pinKeyEncryptedUserKey?: string; // EncryptedString
    protectedPin?: string;
    pinProtected?: {
      encrypted?: string;
    };
  };
};

const PIN_STATE: StateDefinitionLike = { name: "pin" };

const PIN_KEY_ENCRYPTED_USER_KEY: KeyDefinitionLike = {
  stateDefinition: PIN_STATE,
  key: "pinKeyEncryptedUserKey",
};

const PROTECTED_PIN: KeyDefinitionLike = {
  stateDefinition: PIN_STATE,
  key: "protectedPin",
};

const OLD_PIN_KEY_ENCRYPTED_MASTER_KEY: KeyDefinitionLike = {
  stateDefinition: PIN_STATE,
  key: "oldPinKeyEncryptedMasterKey",
};

export class PinMigrator extends Migrator<58, 59> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const legacyAccounts = await helper.getAccounts<ExpectedAccountState>();
    let updatedAccount = false;

    async function migrateAccount(userId: string, account: ExpectedAccountState) {
      // Migrate pinKeyEncryptedUserKey
      if (account?.settings?.pinKeyEncryptedUserKey != null) {
        await helper.setToUser(
          userId,
          PIN_KEY_ENCRYPTED_USER_KEY,
          account.settings.pinKeyEncryptedUserKey,
        );
        delete account.settings.pinKeyEncryptedUserKey;
        updatedAccount = true;
      }

      // Migrate protectedPin
      if (account?.settings?.protectedPin != null) {
        await helper.setToUser(userId, PROTECTED_PIN, account.settings.protectedPin);
        delete account.settings.protectedPin;
        updatedAccount = true;
      }

      // Migrate pinProtected
      if (account?.settings?.pinProtected?.encrypted != null) {
        await helper.setToUser(
          userId,
          OLD_PIN_KEY_ENCRYPTED_MASTER_KEY,
          account.settings.pinProtected.encrypted,
        );
        delete account.settings.pinProtected;
        updatedAccount = true;
      }

      if (updatedAccount) {
        await helper.set(userId, account);
      }
    }

    await Promise.all([
      ...legacyAccounts.map(({ userId, account }) => migrateAccount(userId, account)),
    ]);
  }

  async rollback(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountState>();

    async function rollbackAccount(userId: string, account: ExpectedAccountState) {
      let updatedAccount = false;

      const accountPinKeyEncryptedUserKey = await helper.getFromUser<string>(
        userId,
        PIN_KEY_ENCRYPTED_USER_KEY,
      );
      const accountProtectedPin = await helper.getFromUser<string>(userId, PROTECTED_PIN);
      const accountOldPinKeyEncryptedMasterKey = await helper.getFromUser<string>(
        userId,
        OLD_PIN_KEY_ENCRYPTED_MASTER_KEY,
      );

      if (!account) {
        account = {};
      }

      if (accountPinKeyEncryptedUserKey != null) {
        account.settings.pinKeyEncryptedUserKey = accountPinKeyEncryptedUserKey;
        await helper.setToUser(userId, PIN_KEY_ENCRYPTED_USER_KEY, null);
        updatedAccount = true;
      }

      if (accountProtectedPin != null) {
        account.settings.protectedPin = accountProtectedPin;
        await helper.setToUser(userId, PROTECTED_PIN, null);
        updatedAccount = true;
      }

      if (accountOldPinKeyEncryptedMasterKey != null) {
        account.settings.pinProtected.encrypted = accountOldPinKeyEncryptedMasterKey;
        await helper.setToUser(userId, OLD_PIN_KEY_ENCRYPTED_MASTER_KEY, null);
        updatedAccount = true;
      }

      if (updatedAccount) {
        await helper.set(userId, account);
      }
    }

    await Promise.all(accounts.map(({ userId, account }) => rollbackAccount(userId, account)));
  }
}
