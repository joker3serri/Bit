import { StateService as BaseStateService } from "@bitwarden/common/src/abstractions/state.service";
import { StorageOptions } from "@bitwarden/common/src/models/domain/storageOptions";

import { Account } from "src/models/account";

export abstract class StateService extends BaseStateService<Account> {
  getRememberEmail: (options?: StorageOptions) => Promise<boolean>;
  setRememberEmail: (value: boolean, options?: StorageOptions) => Promise<void>;
}
