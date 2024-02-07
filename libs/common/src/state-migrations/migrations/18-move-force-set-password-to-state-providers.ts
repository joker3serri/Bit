import { KeyDefinitionLike, MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedAccountType = {
  profile?: {
    forceSetPasswordReason?: number;
  };
};

export const FORCE_SET_PASSWORD_REASON_DEFINITION: KeyDefinitionLike = {
  key: "forceSetPasswordReason",
  stateDefinition: {
    name: "masterPassword",
  },
};

export class MoveForceSetPasswordReasonToStateProviderMigrator extends Migrator<17, 18> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountType>();
    async function migrateAccount(userId: string, account: ExpectedAccountType): Promise<void> {
      const forceSetPasswordReason = account?.profile?.forceSetPasswordReason;
      await helper.setToUser(userId, FORCE_SET_PASSWORD_REASON_DEFINITION, forceSetPasswordReason);
      if (forceSetPasswordReason != null) {
        delete account.profile.forceSetPasswordReason;
      }
      await helper.set(userId, account);
    }

    await Promise.all([...accounts.map(({ userId, account }) => migrateAccount(userId, account))]);
  }
  async rollback(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountType>();
    async function rollbackAccount(userId: string, account: ExpectedAccountType): Promise<void> {
      const forceSetPasswordReason = await helper.getFromUser(
        userId,
        FORCE_SET_PASSWORD_REASON_DEFINITION,
      );
      if (account) {
        if (forceSetPasswordReason) {
          account.profile = Object.assign(account.profile ?? {}, {
            forceSetPasswordReason: forceSetPasswordReason,
          });
        }
        await helper.set(userId, account);
      }
      await helper.setToUser(userId, FORCE_SET_PASSWORD_REASON_DEFINITION, null);
    }

    await Promise.all([...accounts.map(({ userId, account }) => rollbackAccount(userId, account))]);
  }
}
