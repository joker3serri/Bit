import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared/shared.module";

import { NestedCheckboxComponent } from "./nested-checkbox.component";
import { UserDialogComponent } from "./user-dialog.component";

@NgModule({
  declarations: [UserDialogComponent, NestedCheckboxComponent],
  imports: [SharedModule],
  exports: [UserDialogComponent],
})
export class UserDialogModule {}
