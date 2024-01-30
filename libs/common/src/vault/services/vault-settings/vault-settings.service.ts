import { Observable, map } from "rxjs";

import { GlobalState, StateProvider } from "../../../platform/state";
import { VaultSettingsService as VaultSettingsServiceAbstraction } from "../../abstractions/vault-settings/vault-settings.service";
import { USER_ENABLE_PASSKEYS } from "../key-state/enable-passkey.state";

/**
 * {@link VaultSettingsServiceAbstraction}
 */
export class VaultSettingsService implements VaultSettingsServiceAbstraction {
  private enablePasskeysState: GlobalState<boolean>;

  constructor(private stateProvider: StateProvider) {
    this.enablePasskeysState = stateProvider.getGlobal(USER_ENABLE_PASSKEYS);
  }

  /**
   * {@link VaultSettingsServiceAbstraction.enablePasskeys$}
   */
  get enablePasskeys$(): Observable<boolean> {
    return this.enablePasskeysState.state$.pipe(map((x) => x ?? false));
  }

  /**
   * {@link VaultSettingsServiceAbstraction.setEnablePasskeys}
   */
  async setEnablePasskeys(value: boolean): Promise<void> {
    await this.enablePasskeysState.update(() => value);
  }
}
