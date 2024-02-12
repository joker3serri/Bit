import { Observable, firstValueFrom } from "rxjs";
import { Jsonify } from "type-fest";

import {
  ActiveUserState,
  KeyDefinition,
  StateProvider,
  VAULT_BROWSER_COMPONENT_MEMORY,
  VAULT_BROWSER_GROUPINGS_COMPONENT_MEMORY,
} from "@bitwarden/common/platform/state";

import { BrowserComponentState } from "../../models/browserComponentState";
import { BrowserGroupingsComponentState } from "../../models/browserGroupingsComponentState";

import { VaultBrowserStateServiceAbstraction } from "./abstractions/vault-browser-state.service.abstraction";

export const VAULT_BROWSER_GROUPINGS_COMPONENT =
  KeyDefinition.record<BrowserGroupingsComponentState>(
    VAULT_BROWSER_GROUPINGS_COMPONENT_MEMORY,
    "vault_browser_groupings_component",
    {
      deserializer: (obj: Jsonify<BrowserGroupingsComponentState>) =>
        BrowserGroupingsComponentState.fromJSON(obj),
    },
  );

export const VAULT_BROWSER_COMPONENT = KeyDefinition.record<BrowserComponentState>(
  VAULT_BROWSER_COMPONENT_MEMORY,
  "vault_browser_component",
  {
    deserializer: (obj: Jsonify<BrowserComponentState>) => BrowserComponentState.fromJSON(obj),
  },
);

export class VaultBrowserStateService implements VaultBrowserStateServiceAbstraction {
  vaultBrowserGroupingsComponent$: Observable<BrowserGroupingsComponentState>;
  vaultBrowserComponent$: Observable<BrowserComponentState>;

  private activeUserVaultBrowserGroupingsComponentState: ActiveUserState<
    Record<string, BrowserGroupingsComponentState>
  >;
  private activeUserVaultBrowserComponentState: ActiveUserState<
    Record<string, BrowserComponentState>
  >;

  constructor(protected stateProvider: StateProvider) {
    this.activeUserVaultBrowserGroupingsComponentState = this.stateProvider.getActive(
      VAULT_BROWSER_GROUPINGS_COMPONENT,
    );
    this.activeUserVaultBrowserComponentState =
      this.stateProvider.getActive(VAULT_BROWSER_COMPONENT);
  }

  async getBrowserGroupingComponentState(): Promise<BrowserGroupingsComponentState> {
    return (await firstValueFrom(this.activeUserVaultBrowserGroupingsComponentState.state$))
      ?.groupings;
  }

  async setBrowserGroupingComponentState(value: BrowserGroupingsComponentState): Promise<void> {
    await this.activeUserVaultBrowserGroupingsComponentState.update((groupings) => {
      groupings ??= {};
      groupings[0] = value;
      return groupings;
    });
  }

  async getBrowserVaultItemsComponentState(): Promise<BrowserComponentState> {
    return (await firstValueFrom(this.activeUserVaultBrowserComponentState.state$))?.ciphers;
  }

  async setBrowserVaultItemsComponentState(value: BrowserComponentState): Promise<void> {
    await this.activeUserVaultBrowserComponentState.update((ciphers) => {
      ciphers ??= {};
      ciphers[0] = value;
      return ciphers;
    });
  }
}
