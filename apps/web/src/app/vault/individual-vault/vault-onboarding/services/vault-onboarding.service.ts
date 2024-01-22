import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  ActiveUserState,
  KeyDefinition,
  StateProvider,
  VAULT_ONBOARDING,
} from "@bitwarden/common/platform/state";

import { VaultOnboardingService as VaultOnboardingServiceAbstraction } from "./abstraction/vault-onboarding.service";

export type VaultOnboardingTasks = {
  createAccount: boolean;
  importData: boolean;
  installExtension: boolean;
};

const VAULT_ONBOARDING_KEY = new KeyDefinition<any>(VAULT_ONBOARDING, "data", {
  deserializer: (jsonData) => jsonData,
});

@Injectable()
export class VaultOnboardingService implements VaultOnboardingServiceAbstraction {
  private vaultOnboardingState: ActiveUserState<Record<string, VaultOnboardingTasks>>;
  vaultOnboardingState$: Observable<Record<string, VaultOnboardingTasks>>;

  constructor(private stateProvider: StateProvider) {
    this.vaultOnboardingState = this.stateProvider.getActive(VAULT_ONBOARDING_KEY);
    this.vaultOnboardingState$ = this.vaultOnboardingState.state$;
  }

  setVaultOnboardingTasks(newState: VaultOnboardingTasks) {
    this.vaultOnboardingState.update(() => {
      return { vaultTasks: { ...newState } };
    });
  }
}
