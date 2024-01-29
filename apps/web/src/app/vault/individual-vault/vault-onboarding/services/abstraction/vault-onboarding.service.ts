import { Observable } from "rxjs";

import { VaultOnboardingTasks } from "../vault-onboarding.service";

export abstract class VaultOnboardingService {
  vaultOnboardingState$: Observable<Record<string, VaultOnboardingTasks>>;
  abstract setVaultOnboardingTasks(newState: any): any;
}
