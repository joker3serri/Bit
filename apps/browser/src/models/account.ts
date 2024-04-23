import { Jsonify } from "type-fest";

import {
  Account as BaseAccount,
  AccountSettings as BaseAccountSettings,
} from "@bitwarden/common/platform/models/domain/account";

export class AccountSettings extends BaseAccountSettings {
  vaultTimeout = -1; // On Restart

  static fromJSON(json: Jsonify<AccountSettings>): AccountSettings {
    if (json == null) {
      return null;
    }

    return Object.assign(new AccountSettings(), json, super.fromJSON(json));
  }
}

export class Account extends BaseAccount {
  settings?: AccountSettings = new AccountSettings();

  constructor(init: Partial<Account>) {
    super(init);
    Object.assign(this.settings, {
      ...new AccountSettings(),
      ...this.settings,
    });
  }

  static fromJSON(json: Jsonify<Account>): Account {
    if (json == null) {
      return null;
    }

    return Object.assign(new Account({}), json, super.fromJSON(json), {
      settings: AccountSettings.fromJSON(json.settings),
    });
  }
}
