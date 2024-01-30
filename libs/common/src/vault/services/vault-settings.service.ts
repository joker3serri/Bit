import { Observable, map } from "rxjs";

import { ActiveUserState, StateProvider } from "../../platform/state";
import { VaultSettingsService as VaultSettingsServiceAbstraction } from "../abstractions/vault-settings.service";

import { USER_ENABLE_PASSKEYS } from "./key-state/enable-passkey.state";

export class VaultSettingsService implements VaultSettingsServiceAbstraction {
  private enablePasskeysState: ActiveUserState<boolean>;

  enablePasskeysState$: Observable<boolean>;

  constructor(private stateProvider: StateProvider) {
    this.enablePasskeysState = stateProvider.getActive(USER_ENABLE_PASSKEYS);
    this.enablePasskeysState$ = this.enablePasskeysState.state$;
  }

  get enablePasskeys$(): Observable<boolean> {
    return this.enablePasskeysState$.pipe(map((x) => x ?? false));
  }

  async setEnablePasskeys(value: boolean): Promise<void> {
    await this.enablePasskeysState.update(() => value);
  }
}
