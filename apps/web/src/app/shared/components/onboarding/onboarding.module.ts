import { NgModule } from "@angular/core";

import { ProgressModule } from "@bitwarden/components";

import { VaultOnboardingService as VaultOnboardingServiceAbstraction } from "../../../vault/individual-vault/vault-onboarding/services/abstraction/vault-onboarding.service";
import { VaultOnboardingService } from "../../../vault/individual-vault/vault-onboarding/services/vault-onboarding.service";
import { SharedModule } from "../../shared.module";

import { OnboardingTaskComponent } from "./onboarding-task.component";
import { OnboardingComponent } from "./onboarding.component";

@NgModule({
  imports: [SharedModule, ProgressModule],
  exports: [OnboardingComponent, OnboardingTaskComponent],
  declarations: [OnboardingComponent, OnboardingTaskComponent],
  providers: [
    {
      provide: VaultOnboardingServiceAbstraction,
      useClass: VaultOnboardingService,
    },
  ],
})
export class OnboardingModule {}
