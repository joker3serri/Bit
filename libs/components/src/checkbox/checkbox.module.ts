import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormControlModule } from "../form-control";
import { SharedModule } from "../shared";

import { CheckboxControlComponent } from "./checkbox-control.component";
import { CheckboxComponent } from "./checkbox.component";

@NgModule({
  imports: [SharedModule, CommonModule, FormControlModule],
  declarations: [CheckboxComponent, CheckboxControlComponent],
  exports: [CheckboxComponent, CheckboxControlComponent],
})
export class CheckboxModule {}
