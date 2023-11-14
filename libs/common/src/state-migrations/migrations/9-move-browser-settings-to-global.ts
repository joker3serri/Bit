import { MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

type NeverDomains = { [id: string]: unknown };

type ExpectedAccountType = {
  settings?: {
    neverDomains?: NeverDomains;
    disableAddLoginNotification?: boolean;
    disableChangedPasswordNotification?: boolean;
  };
};

type TargetGlobalState = {
  neverDomains?: NeverDomains;
  disableAddLoginNotification?: boolean;
  disableChangedPasswordNotification?: boolean;
};

export class MoveBrowserSettingsToGlobal extends Migrator<8, 9> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const global = await helper.get<object>("global");

    const accounts = await helper.getAccounts<ExpectedAccountType>();

    const globalNeverDomainsValue = accounts.reduce((accumulator, { account }) => {
      const normalizedNeverDomains = account.settings?.neverDomains ?? {};
      for (const [id, value] of Object.entries(normalizedNeverDomains)) {
        accumulator ??= {};
        accumulator[id] = value;
      }
      return accumulator;
    }, undefined as NeverDomains);

    // Has disableAddLoginNotification been set to a value for any account
    const globalDisableAddLoginNotificationHasValue = accounts.some(({ account }) => {
      return account.settings?.disableAddLoginNotification !== undefined;
    });

    let globalDisableAddLoginNotificationValue;
    if (globalDisableAddLoginNotificationHasValue) {
      globalDisableAddLoginNotificationValue = !accounts.some(({ account }) => {
        return account.settings?.disableAddLoginNotification === false;
      });
    }

    // Has disableChangedPasswordNotification been set to a value for any account
    const globalDisableChangedPasswordNotificationHasValue = accounts.some(({ account }) => {
      return account.settings?.disableChangedPasswordNotification !== undefined;
    });

    let globalDisableChangedPasswordNotificationValue;
    if (globalDisableChangedPasswordNotificationHasValue) {
      globalDisableChangedPasswordNotificationValue = !accounts.some(({ account }) => {
        return account.settings?.disableChangedPasswordNotification === false;
      });
    }

    const targetGlobalState: TargetGlobalState = {};
    if (globalNeverDomainsValue != null) {
      targetGlobalState.neverDomains = globalNeverDomainsValue;
    }

    if (globalDisableAddLoginNotificationValue !== undefined) {
      targetGlobalState.disableAddLoginNotification = globalDisableAddLoginNotificationValue;
    }

    if (globalDisableChangedPasswordNotificationValue !== undefined) {
      targetGlobalState.disableChangedPasswordNotification =
        globalDisableChangedPasswordNotificationValue;
    }

    await helper.set<TargetGlobalState>("global", {
      ...global,
      ...targetGlobalState,
    });

    await Promise.all(
      accounts.map(async ({ userId, account }) => {
        delete account.settings?.disableAddLoginNotification;
        delete account.settings?.disableChangedPasswordNotification;
        delete account.settings?.neverDomains;
        await helper.set(userId, account);
      })
    );
  }

  rollback(helper: MigrationHelper): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
