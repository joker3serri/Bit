import { NgModule } from "@angular/core";

import { RadioButtonModule } from "@bitwarden/components";

import { SharedOrganizationModule } from "../../../shared";

import { MemberDialogComponent } from "./member-dialog.component";
import { NestedCheckboxComponent } from "./nested-checkbox.component";
import { FreeOrgSeatLimitReachedValidator } from "./validators/free-org-inv-limit-reached.validator";

@NgModule({
  declarations: [MemberDialogComponent, NestedCheckboxComponent],
  imports: [SharedOrganizationModule, RadioButtonModule],
  exports: [MemberDialogComponent],
  providers: [FreeOrgSeatLimitReachedValidator],
})
export class UserDialogModule {}
