import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { ScimComponent } from "../../admin-console/organizations/manage/scim.component";

import { InputCheckboxComponent } from "./components/input-checkbox.component";
import { SsoComponent } from "./manage/sso.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

@NgModule({
  imports: [SharedModule, OrganizationsRoutingModule],
  declarations: [InputCheckboxComponent, SsoComponent, ScimComponent],
})
export class OrganizationsModule {}
