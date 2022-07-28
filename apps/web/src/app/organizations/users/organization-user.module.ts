import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "../../shared/loose-components.module";
import { SharedModule } from "../../shared/shared.module";

import { EnrollMasterPasswordReset } from "./enroll-master-password-reset.component";

@NgModule({
  imports: [SharedModule, ScrollingModule, LooseComponentsModule],
  declarations: [EnrollMasterPasswordReset],
  exports: [EnrollMasterPasswordReset],
})
export class OrganizationUserModule {}
