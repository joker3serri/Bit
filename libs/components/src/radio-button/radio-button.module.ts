import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormControlModule } from "../form-control";
import { IconModule } from "../icon";

import { RadioButtonComponent } from "./radio-button.component";
import { RadioGroupComponent } from "./radio-group.component";

@NgModule({
  imports: [CommonModule, FormControlModule, IconModule],
  declarations: [RadioButtonComponent, RadioGroupComponent],
  exports: [FormControlModule, RadioButtonComponent, RadioGroupComponent],
})
export class RadioButtonModule {}
