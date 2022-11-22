import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { FormControlLabel } from "./form-control-label.directive";
import { FormControlComponent } from "./form-control.component";

@NgModule({
  imports: [SharedModule],
  declarations: [FormControlComponent, FormControlLabel],
  exports: [FormControlComponent, FormControlLabel],
})
export class FormControlModule {}
