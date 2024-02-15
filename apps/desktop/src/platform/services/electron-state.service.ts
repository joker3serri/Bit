import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";
import { StorageOptions } from "@bitwarden/common/platform/models/domain/storage-options";
import { StateService as BaseStateService } from "@bitwarden/common/platform/services/state.service";

import { Account } from "../../models/account";

import { ElectronStateService as ElectronStateServiceAbstraction } from "./electron-state.service.abstraction";

export class ElectronStateService
  extends BaseStateService<GlobalState, Account>
  implements ElectronStateServiceAbstraction
{
  async addAccount(account: Account) {
    // Apply desktop overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }

  async getDismissedBiometricRequirePasswordOnStart(options?: StorageOptions): Promise<boolean> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions()),
    );
    return account?.settings?.dismissedBiometricRequirePasswordOnStartCallout;
  }

  async setDismissedBiometricRequirePasswordOnStart(options?: StorageOptions): Promise<void> {
    const account = await this.getAccount(
      this.reconcileOptions(options, await this.defaultOnDiskOptions()),
    );
    account.settings.dismissedBiometricRequirePasswordOnStartCallout = true;
    await this.saveAccount(
      account,
      this.reconcileOptions(options, await this.defaultOnDiskOptions()),
    );
  }
}
