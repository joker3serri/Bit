import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedModule } from "../../shared";

import { DisableSendPolicyComponent } from "./components/disable-send.component";
import { MasterPasswordPolicyComponent } from "./components/master-password.component";
import { PasswordGeneratorPolicyComponent } from "./components/password-generator.component";
import { PersonalOwnershipPolicyComponent } from "./components/personal-ownership.component";
import { RequireSsoPolicyComponent } from "./components/require-sso.component";
import { ResetPasswordPolicyComponent } from "./components/reset-password.component";
import { SendOptionsPolicyComponent } from "./components/send-options.component";
import { SingleOrgPolicyComponent } from "./components/single-org.component";
import { TwoFactorAuthenticationPolicyComponent } from "./components/two-factor-authentication.component";

@NgModule({
  imports: [SharedModule, LooseComponentsModule],
  declarations: [
    DisableSendPolicyComponent,
    MasterPasswordPolicyComponent,
    PasswordGeneratorPolicyComponent,
    PersonalOwnershipPolicyComponent,
    RequireSsoPolicyComponent,
    ResetPasswordPolicyComponent,
    SendOptionsPolicyComponent,
    SingleOrgPolicyComponent,
    TwoFactorAuthenticationPolicyComponent,
  ],
  exports: [
    DisableSendPolicyComponent,
    MasterPasswordPolicyComponent,
    PasswordGeneratorPolicyComponent,
    PersonalOwnershipPolicyComponent,
    RequireSsoPolicyComponent,
    ResetPasswordPolicyComponent,
    SendOptionsPolicyComponent,
    SingleOrgPolicyComponent,
    TwoFactorAuthenticationPolicyComponent,
  ],
})
export class PoliciesModule {}
