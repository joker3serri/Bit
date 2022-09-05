import { DialogModule as CdkDialogModule } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { I18nPipe } from "../shared";

import { DialogService } from "./dialog.service";
import { DialogComponent } from "./dialog/dialog.component";
import { DialogCloseDirective } from "./directives/dialog-close.directive";
import { DialogTitleContainerDirective } from "./directives/dialog-title-container.directive";
import { SimpleDialogComponent } from "./simple-dialog/simple-dialog.component";

@NgModule({
  imports: [CommonModule, CdkDialogModule],
  declarations: [
    DialogCloseDirective,
    DialogComponent,
    DialogTitleContainerDirective,
    SimpleDialogComponent,
    I18nPipe,
  ],
  exports: [CdkDialogModule, DialogComponent, SimpleDialogComponent],
  providers: [DialogService],
})
export class DialogModule {}
