import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";

import { SharedModule } from "../../shared";
import { GroupServiceAbstraction } from "../services/abstractions/group";
import { GroupService } from "../services/group/group.service";

import { EntityUsersComponent } from "./entity-users.component";
import { UserDialogModule } from "./member-dialog";

@NgModule({
  imports: [SharedModule, ScrollingModule, UserDialogModule],
  declarations: [EntityUsersComponent],
  exports: [EntityUsersComponent],
  providers: [
    {
      provide: GroupServiceAbstraction,
      useClass: GroupService,
      deps: [ApiService],
    },
  ],
})
export class OrganizationManageModule {}
