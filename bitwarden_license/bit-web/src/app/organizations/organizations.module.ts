import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";

import { InputCheckboxComponent } from "./components/input-checkbox.component";
import { ScimComponent } from "./manage/scim.component";
import { SsoComponent } from "./manage/sso.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

// Form components are for use in the SSO Configuration Form only and should not be exported for use elsewhere.
// They will be deprecated by the Component Library.
@NgModule({
  imports: [SharedModule, OrganizationsRoutingModule],
  declarations: [InputCheckboxComponent, SsoComponent, ScimComponent],
})
export class OrganizationsModule {}
