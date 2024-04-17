import { KeyDefinitionLike, MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedAccountType = {
  tokens?: {
    securityStamp?: string;
  };
};

export const SECURITY_STAMP_MEMORY: KeyDefinitionLike = {
  key: "securityStamp", // matches KeyDefinition.key in DeviceTrustCryptoService
  stateDefinition: {
    name: "token", // matches StateDefinition.name in StateDefinitions
  },
};

export class SecurityStampTokenServiceStateProviderMigrator extends Migrator<58, 59> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountType>();
    async function migrateAccount(userId: string, account: ExpectedAccountType): Promise<void> {
      let updatedAccount = false;

      const existingSecurityStamp = account?.tokens?.securityStamp;

      if (existingSecurityStamp != null) {
        // Only migrate data that exists
        await helper.setToUser(userId, SECURITY_STAMP_MEMORY, existingSecurityStamp);
        delete account.tokens.securityStamp;

        if (Object.keys(account.tokens).length === 0) {
          // We can delete the tokens object if it's empty as this should fully deprecate account tokens object
          delete account.tokens;
        }

        updatedAccount = true;
      }

      if (updatedAccount) {
        // Save the migrated account
        await helper.set(userId, account);
      }
    }

    await Promise.all([...accounts.map(({ userId, account }) => migrateAccount(userId, account))]);
  }

  async rollback(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountType>();
    async function rollbackAccount(userId: string, account: ExpectedAccountType): Promise<void> {
      const migratedSecurityStamp: string = await helper.getFromUser(userId, SECURITY_STAMP_MEMORY);

      if (account && account.tokens === undefined) {
        account.tokens = {};
      }

      if (account?.tokens && migratedSecurityStamp != null) {
        account.tokens.securityStamp = migratedSecurityStamp;
        await helper.set(userId, account);
      }

      await helper.setToUser(userId, SECURITY_STAMP_MEMORY, null);
    }

    await Promise.all([...accounts.map(({ userId, account }) => rollbackAccount(userId, account))]);
  }
}
