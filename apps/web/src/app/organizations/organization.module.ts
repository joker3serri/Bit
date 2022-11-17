import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { AccessSelectorModule } from "./components/access-selector";
import { OrgUpgradeDialogComponent } from "./manage/org-upgrade-dialog/org-upgrade-dialog.component";
import { OrganizationsRoutingModule } from "./organization-routing.module";

@NgModule({
  imports: [SharedModule, AccessSelectorModule, OrganizationsRoutingModule],
  declarations: [OrgUpgradeDialogComponent],
})
export class OrganizationModule {}
