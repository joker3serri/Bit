import { NgModule } from "@angular/core";

import { GroupAddEditComponent } from "../../admin-console/organizations/manage/group-add-edit.component";
import { GroupsComponent } from "../../admin-console/organizations/manage/groups.component";
import { AccessSelectorModule } from "../../admin-console/organizations/shared/components/access-selector";
import { CoreOrganizationModule } from "../../app/organizations/core";
import { SharedOrganizationModule } from "../../app/organizations/shared";

import { OrganizationsRoutingModule } from "./organization-routing.module";

@NgModule({
  imports: [
    SharedOrganizationModule,
    AccessSelectorModule,
    CoreOrganizationModule,
    OrganizationsRoutingModule,
  ],
  declarations: [GroupsComponent, GroupAddEditComponent],
})
export class OrganizationModule {}
