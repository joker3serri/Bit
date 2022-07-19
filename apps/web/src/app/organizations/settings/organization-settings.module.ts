import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedModule} from "../../shared";

import { AccountComponent } from "./components/account.component";
import { AdjustSubscription } from "./components/adjust-subscription.component";
import { ChangePlanComponent } from "./components/change-plan.component";
import { DeleteOrganizationComponent } from "./components/delete-organization.component";
import { DownloadLicenseComponent } from "./components/download-license.component";
import { ImageSubscriptionHiddenComponent } from "./components/image-subscription-hidden.component";
import { TwoFactorSetupComponent } from "./components/two-factor-setup.component";
import { SettingsComponent } from "./settings.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule],
  declarations: [
    SettingsComponent,
    AccountComponent,
    AdjustSubscription,
    ChangePlanComponent,
    DeleteOrganizationComponent,
    DownloadLicenseComponent,
    ImageSubscriptionHiddenComponent,
    TwoFactorSetupComponent,
  ],
  exports: [
    SettingsComponent,
    AccountComponent,
    AdjustSubscription,
    ChangePlanComponent,
    DeleteOrganizationComponent,
    DownloadLicenseComponent,
    ImageSubscriptionHiddenComponent,
    TwoFactorSetupComponent,
  ],
})
export class OrganizationSettingsModule {}
