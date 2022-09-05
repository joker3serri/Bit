import { DialogModule as CdkDialogModule } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DialogCloseDirective } from "./dialog-close.directive";
import { DialogTitleDirective } from "./dialog-title.directive";
import { DialogService } from "./dialog.service";
import { DialogComponent } from "./dialog/dialog.component";
import { SimpleDialogComponent } from "./simple-dialog/simple-dialog.component";

@NgModule({
  imports: [CommonModule, CdkDialogModule],
  declarations: [
    DialogCloseDirective,
    DialogComponent,
    DialogTitleDirective,
    SimpleDialogComponent,
  ],
  exports: [CdkDialogModule, DialogComponent, DialogTitleDirective, SimpleDialogComponent],
  providers: [DialogService],
})
export class DialogModule {}
