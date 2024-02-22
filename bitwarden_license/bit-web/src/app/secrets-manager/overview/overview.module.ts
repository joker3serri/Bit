import { NgModule } from "@angular/core";

import { OnboardingModule } from "../../../../../../apps/web/src/app/shared/components/onboarding/onboarding.module";
import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { OverviewRoutingModule } from "./overview-routing.module";
import { OverviewComponent } from "./overview.component";
import { SectionComponent } from "./section.component";
import { SMOnboardingTasksService } from "./sm-onboarding-tasks.service";

@NgModule({
  imports: [SecretsManagerSharedModule, OverviewRoutingModule, OnboardingModule],
  declarations: [OverviewComponent, SectionComponent, SMOnboardingTasksService],
  providers: [],
})
export class OverviewModule {}
