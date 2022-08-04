import { DialogModule } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ModalCloseDirective } from "./dialog-content.directives";
import { ModalSimpleComponent } from "./dialog-simple.component";
import { ModalComponent } from "./dialog.component";
import { DialogService } from "./dialog.service";

@NgModule({
  imports: [CommonModule, DialogModule],
  declarations: [ModalCloseDirective, ModalComponent, ModalSimpleComponent],
  exports: [DialogModule, ModalComponent, ModalSimpleComponent],
  providers: [DialogService],
})
export class ModalModule {}
