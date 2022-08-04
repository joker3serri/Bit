import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedModule} from "../../shared";
import { PoliciesModule } from "../policies";

import { AccountComponent } from "./components/account.component";
import { AdjustSubscription } from "./components/adjust-subscription.component";
import { ChangePlanComponent } from "./components/change-plan.component";
import { DeleteOrganizationComponent } from "./components/delete-organization.component";
import { DownloadLicenseComponent } from "./components/download-license.component";
import { PoliciesComponent } from "./components/policies.component";
import { PolicyEditComponent } from "./components/policy-edit.component";
import { TwoFactorSetupComponent } from "./components/two-factor-setup.component";
import { OrganizationSettingsRoutingModule } from "./organization-settings-routing.module";
import { SettingsComponent } from "./settings.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule, PoliciesModule, OrganizationSettingsRoutingModule],
  declarations: [
    SettingsComponent,
    AccountComponent,
    AdjustSubscription,
    ChangePlanComponent,
    DeleteOrganizationComponent,
    DownloadLicenseComponent,
    TwoFactorSetupComponent,
    PoliciesComponent,
    PolicyEditComponent,
  ],
})
export class OrganizationSettingsModule {}
