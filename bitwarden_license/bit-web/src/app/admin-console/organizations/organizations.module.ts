import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { InputCheckboxComponent } from "../admin-console/organizations/components/input-checkbox.component";
import { ScimComponent } from "../admin-console/organizations/manage/scim.component";
import { OrganizationsRoutingModule } from "../admin-console/organizations/organizations-routing.module";
import { SsoComponent } from "../auth/sso/sso.component";

import { DomainAddEditDialogComponent } from "./manage/domain-verification/domain-add-edit-dialog/domain-add-edit-dialog.component";
import { DomainVerificationComponent } from "./manage/domain-verification/domain-verification.component";

@NgModule({
  imports: [SharedModule, OrganizationsRoutingModule],
  declarations: [
    InputCheckboxComponent,
    SsoComponent,
    ScimComponent,
    DomainVerificationComponent,
    DomainAddEditDialogComponent,
  ],
})
export class OrganizationsModule {}
