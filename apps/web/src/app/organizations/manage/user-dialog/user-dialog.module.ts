import { NgModule } from "@angular/core";

import { SharedModule } from "../../../shared/shared.module";

import { UserDialogComponent } from "./user-dialog.component";

@NgModule({
  declarations: [UserDialogComponent],
  imports: [SharedModule],
  exports: [UserDialogComponent],
})
export class UserDialogModule {}
