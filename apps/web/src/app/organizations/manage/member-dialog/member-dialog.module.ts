import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared/shared.module";
import { AccessSelectorModule } from "../../shared/components/access-selector";

import { MemberDialogComponent } from "./member-dialog.component";
import { NestedCheckboxComponent } from "./nested-checkbox.component";

@NgModule({
  declarations: [MemberDialogComponent, NestedCheckboxComponent],
  imports: [SharedModule, AccessSelectorModule],
  exports: [MemberDialogComponent],
})
export class UserDialogModule {}
