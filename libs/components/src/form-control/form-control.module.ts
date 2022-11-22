import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { FormControlComponent } from "./form-control.component";
import { BitLabel } from "./label.directive";

@NgModule({
  imports: [SharedModule],
  declarations: [FormControlComponent, BitLabel],
  exports: [FormControlComponent, BitLabel],
})
export class FormControlModule {}
