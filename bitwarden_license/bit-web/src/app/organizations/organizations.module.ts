import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { ScimComponent } from "../../admin-console/organizations/manage/scim.component";
import { SsoComponent } from "../auth/sso.component";

import { InputCheckboxComponent } from "./components/input-checkbox.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

@NgModule({
  imports: [SharedModule, OrganizationsRoutingModule],
  declarations: [InputCheckboxComponent, SsoComponent, ScimComponent],
})
export class OrganizationsModule {}
