import { CdkStepperModule } from "@angular/cdk/stepper";
import { TitleCasePipe } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormFieldModule } from "@bitwarden/components";

import { OrganizationCreateModule } from "../../organizations/create/organization-create.module";
import { LooseComponentsModule, SharedModule } from "../../shared";
import { RegisterFormModule } from "../register-form/register-form.module";

import { BillingComponent } from "./billing.component";
import { CnetEnterpriseContentComponent } from "./cnet-enterprise-content.component";
import { CnetIndividualContentComponent } from "./cnet-individual-content.component";
import { CnetTeamsContentComponent } from "./cnet-teams-content.component";
import { ConfirmationDetailsComponent } from "./confirmation-details.component";
import { DefaultContentComponent } from "./default-content.component";
import { EnterpriseContentComponent } from "./enterprise-content.component";
import { Enterprise1ContentComponent } from "./enterprise1-content.component";
import { Enterprise2ContentComponent } from "./enterprise2-content.component";
import { LogoCnetComponent } from "./logo-cnet.component";
import { LogoForbesComponent } from "./logo-forbes.component";
import { LogoUSNewsComponent } from "./logo-us-news.component";
import { TeamsContentComponent } from "./teams-content.component";
import { Teams1ContentComponent } from "./teams1-content.component";
import { Teams2ContentComponent } from "./teams2-content.component";
import { TrialInitiationComponent } from "./trial-initiation.component";
import { VerticalStepperModule } from "./vertical-stepper/vertical-stepper.module";

@NgModule({
  imports: [
    SharedModule,
    CdkStepperModule,
    VerticalStepperModule,
    FormFieldModule,
    RegisterFormModule,
    OrganizationCreateModule,
    LooseComponentsModule,
  ],
  declarations: [
    TrialInitiationComponent,
    EnterpriseContentComponent,
    TeamsContentComponent,
    ConfirmationDetailsComponent,
    BillingComponent,
    DefaultContentComponent,
    EnterpriseContentComponent,
    Enterprise1ContentComponent,
    Enterprise2ContentComponent,
    TeamsContentComponent,
    Teams1ContentComponent,
    Teams2ContentComponent,
    CnetEnterpriseContentComponent,
    CnetIndividualContentComponent,
    CnetTeamsContentComponent,
    LogoCnetComponent,
    LogoForbesComponent,
    LogoUSNewsComponent,
  ],
  exports: [TrialInitiationComponent],
  providers: [TitleCasePipe],
})
export class TrialInitiationModule {}
