import { NgModule } from "@angular/core";

import { ButtonModule } from "../button";
import { SharedModule } from "../shared";

import { BitSubmitDirective } from "./async-submit.directive";
import { BitFormButtonDirective } from "./form-button.directive";

@NgModule({
  imports: [SharedModule, ButtonModule],
  declarations: [BitFormButtonDirective, BitSubmitDirective],
  exports: [BitFormButtonDirective, BitSubmitDirective],
})
export class FormButtonModule {}
