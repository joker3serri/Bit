import { KeyDefinitionLike, MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

type MasterKey = {
  key: Uint8Array;
  encKey?: Uint8Array;
  macKey?: Uint8Array;
  encType: number;
  keyB64: string;
  encKeyB64: string;
  macKeyB64: string;
  meta: any;
};

type ExpectedAccountType = {
  keys?: {
    masterKey?: MasterKey;
  };
  profile?: {
    keyHash?: string;
    forceSetPasswordReason?: number;
  };
};

const MASTER_KEY_DEFINITION: KeyDefinitionLike = {
  key: "masterKey",
  stateDefinition: {
    name: "masterPassword",
  },
};

const MASTER_KEY_HASH_DEFINITION: KeyDefinitionLike = {
  key: "masterKeyHash",
  stateDefinition: {
    name: "masterPassword",
  },
};

const FORCE_SET_PASSWORD_REASON_DEFINITION: KeyDefinitionLike = {
  key: "forceSetPasswordReason",
  stateDefinition: {
    name: "masterPassword",
  },
};

export class MoveMasterKeyAndHashMigrator extends Migrator<11, 12> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const accounts = await helper.getAccounts<ExpectedAccountType>();
    async function migrateAccount(userId: string, account: ExpectedAccountType): Promise<void> {
      // migrate master key
      const masterKey = account?.keys?.masterKey;
      await helper.setToUser(userId, MASTER_KEY_DEFINITION, masterKey);
      if (masterKey != null) {
        delete account.keys.masterKey;
      }
      // migrate master key hash
      const keyHash = account?.profile?.keyHash;
      await helper.setToUser(userId, MASTER_KEY_HASH_DEFINITION, keyHash);
      if (keyHash != null) {
        delete account.profile.keyHash;
      }
      // migrate force set password reason
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
      const masterKey = await helper.getFromUser(userId, MASTER_KEY_DEFINITION);
      const keyHash = await helper.getFromUser(userId, MASTER_KEY_HASH_DEFINITION);
      const forceSetPasswordReason = await helper.getFromUser(
        userId,
        FORCE_SET_PASSWORD_REASON_DEFINITION,
      );
      if (account) {
        if (masterKey) {
          account.keys = Object.assign(account.keys ?? {}, {
            masterKey: masterKey,
          });
        }
        if (keyHash) {
          account.profile = Object.assign(account.profile ?? {}, {
            keyHash: keyHash,
          });
        }
        if (forceSetPasswordReason) {
          account.profile = Object.assign(account.profile ?? {}, {
            forceSetPasswordReason: forceSetPasswordReason,
          });
        }
        await helper.set(userId, account);
      }
      await helper.setToUser(userId, MASTER_KEY_DEFINITION, null);
      await helper.setToUser(userId, MASTER_KEY_HASH_DEFINITION, null);
      await helper.setToUser(userId, FORCE_SET_PASSWORD_REASON_DEFINITION, null);
    }

    await Promise.all([...accounts.map(({ userId, account }) => rollbackAccount(userId, account))]);
  }
}
