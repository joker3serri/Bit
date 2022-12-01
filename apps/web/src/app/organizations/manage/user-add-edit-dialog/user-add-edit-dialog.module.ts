import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared/shared.module";

import { UserAddEditComponent } from "./user-add-edit.component";

@NgModule({
  declarations: [UserAddEditComponent],
  imports: [SharedModule],
  exports: [UserAddEditComponent],
})
export class UserAddEditDialogModule {}
