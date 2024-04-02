import { StateService as BaseStateServiceAbstraction } from "@bitwarden/common/platform/abstractions/state.service";
import { StorageOptions } from "@bitwarden/common/platform/models/domain/storage-options";

import { Account } from "../../../models/account";

export abstract class BrowserStateService extends BaseStateServiceAbstraction<Account> {
  addAccount: (account: Account) => Promise<void>;
  getIsAuthenticated: (options?: StorageOptions) => Promise<boolean>;
}
