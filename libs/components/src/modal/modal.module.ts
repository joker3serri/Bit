import { DialogModule } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ModalCloseDirective } from "./modal-content.directives";
import { ModalSimpleComponent } from "./modal-simple.component";
import { ModalComponent } from "./modal.component";
import { DialogService } from "./modal.service";

@NgModule({
  imports: [CommonModule, DialogModule],
  declarations: [ModalCloseDirective, ModalComponent, ModalSimpleComponent],
  exports: [DialogModule, ModalComponent, ModalSimpleComponent],
  providers: [DialogService],
})
export class ModalModule {}
