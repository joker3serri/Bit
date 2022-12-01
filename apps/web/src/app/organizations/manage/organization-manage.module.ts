import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared";

import { EntityUsersComponent } from "./entity-users.component";
import { UserAddEditDialogModule } from "./user-add-edit-dialog";

@NgModule({
  imports: [SharedModule, ScrollingModule, UserAddEditDialogModule],
  declarations: [EntityUsersComponent],
  exports: [EntityUsersComponent],
})
export class OrganizationManageModule {}
