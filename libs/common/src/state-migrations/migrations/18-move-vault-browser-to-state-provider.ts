import { BrowserGroupingsComponentState } from "../../../../../apps/browser/src/models/browserGroupingsComponentState";
import { KeyDefinitionLike, MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

// type BrowserGroupingsState = {
//     //TODO
// };

type ExpectedAccountState = {
  groupings?: Record<string, BrowserGroupingsComponentState>;
};

const USER_VAULT_BROWSER_GROUPINGS: KeyDefinitionLike = {
  key: "vaultBrowser",
  stateDefinition: {
    name: "groupings",
  },
};

export class VaultBrowser extends Migrator<17, 18> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountState>();
    async function migrateAccout(userId: string, account: ExpectedAccountState): Promise<void> {
      const value = account?.groupings;
      if (value != null) {
        await helper.setToUser(userId, USER_VAULT_BROWSER_GROUPINGS, value);
        delete account.groupings;
        await helper.set(userId, account);
      }
    }

    await Promise.all([...accounts.map(({ userId, account }) => migrateAccout(userId, account))]);
  }

  async rollback(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountState>();
    async function rollbackAccount(userId: string, account: ExpectedAccountState): Promise<void> {
      const value = await helper.getFromUser(userId, USER_VAULT_BROWSER_GROUPINGS);
      if (account) {
        account.groupings = Object.assign(account.groupings ?? {}, {
          CipherType: value,
        });
        await helper.set(userId, account);
      }
      await helper.setToUser(userId, USER_VAULT_BROWSER_GROUPINGS, null);
    }

    await Promise.all([...accounts.map(({ userId, account }) => rollbackAccount(userId, account))]);
  }
}
