import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { BitInputDirective } from "./input.directive";

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BitInputDirective],
  exports: [BitInputDirective, FormsModule],
})
export class InputModule {}
