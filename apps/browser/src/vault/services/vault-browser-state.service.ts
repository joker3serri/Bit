import { Observable, firstValueFrom } from "rxjs";
import { Jsonify } from "type-fest";

import {
  ActiveUserState,
  KeyDefinition,
  StateProvider,
  VAULT_BROWSER_MEMORY,
} from "@bitwarden/common/platform/state";

import { BrowserComponentState } from "../../models/browserComponentState";
import { BrowserGroupingsComponentState } from "../../models/browserGroupingsComponentState";

import { VaultBrowserStateServiceAbstraction } from "./abstractions/vault-browser-state.service.abstraction";

export const VAULT_BROWSER_GROUPINGS_COMPONENT = new KeyDefinition<BrowserGroupingsComponentState>(
  VAULT_BROWSER_MEMORY,
  "vault_browser_groupings_component",
  {
    deserializer: (obj: Jsonify<BrowserGroupingsComponentState>) =>
      BrowserGroupingsComponentState.fromJSON(obj),
  },
);

export const VAULT_BROWSER_COMPONENT = new KeyDefinition<BrowserComponentState>(
  VAULT_BROWSER_MEMORY,
  "vault_browser_component",
  {
    deserializer: (obj: Jsonify<BrowserComponentState>) => BrowserComponentState.fromJSON(obj),
  },
);

export class VaultBrowserStateService implements VaultBrowserStateServiceAbstraction {
  vaultBrowserGroupingsComponent$: Observable<BrowserGroupingsComponentState>;
  vaultBrowserComponent$: Observable<BrowserComponentState>;

  private activeUserVaultBrowserGroupingsComponentState: ActiveUserState<BrowserGroupingsComponentState>;
  private activeUserVaultBrowserComponentState: ActiveUserState<BrowserComponentState>;

  constructor(protected stateProvider: StateProvider) {
    this.activeUserVaultBrowserGroupingsComponentState = this.stateProvider.getActive(
      VAULT_BROWSER_GROUPINGS_COMPONENT,
    );
    this.activeUserVaultBrowserComponentState =
      this.stateProvider.getActive(VAULT_BROWSER_COMPONENT);
  }

  async getBrowserGroupingComponentState(): Promise<BrowserGroupingsComponentState> {
    const ret = await firstValueFrom(this.activeUserVaultBrowserGroupingsComponentState.state$);
    return ret;
  }

  async setBrowserGroupingComponentState(value: BrowserGroupingsComponentState): Promise<void> {
    await this.activeUserVaultBrowserGroupingsComponentState.update(() => value);
  }

  async getBrowserVaultItemsComponentState(): Promise<BrowserComponentState> {
    const ret = await firstValueFrom(this.activeUserVaultBrowserComponentState.state$);
    return ret;
  }

  async setBrowserVaultItemsComponentState(value: BrowserComponentState): Promise<void> {
    await this.activeUserVaultBrowserComponentState.update(() => value);
  }
}
