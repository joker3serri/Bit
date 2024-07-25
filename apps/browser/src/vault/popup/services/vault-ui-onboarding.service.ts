import { Injectable } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import {
  GlobalState,
  KeyDefinition,
  StateProvider,
  VAULT_BROWSER_UI_ONBOARDING,
} from "@bitwarden/common/platform/state";

// Key definition for the Vault UI onboarding state.
// This key is used to store the state of the new UI information dialog.
export const GLOBAL_VAULT_UI_ONBOARDING = new KeyDefinition<boolean>(
  VAULT_BROWSER_UI_ONBOARDING,
  "dialogState",
  {
    deserializer: (obj) => obj,
  },
);

@Injectable()
export class VaultUiOnboardingService {
  private vaultUiOnboardingState: GlobalState<boolean> = this.stateProvider.getGlobal(
    GLOBAL_VAULT_UI_ONBOARDING,
  );

  readonly vaultUiOnboardingState$ = this.vaultUiOnboardingState.state$.pipe(
    map((x) => x ?? false),
  );

  constructor(private stateProvider: StateProvider) {}

  /**
   * Updates and saves the state indicating whether the user has viewed
   * the new UI onboarding information dialog.
   */
  async setVaultUiOnboardingState(value: boolean): Promise<void> {
    await this.vaultUiOnboardingState.update(() => value);
  }

  /**
   * Retrieves the current state indicating whether the user has viewed
   * the new UI onboarding information dialog.s
   */
  async getVaultUiOnboardingState(): Promise<boolean> {
    return await firstValueFrom(this.vaultUiOnboardingState$);
  }
}
