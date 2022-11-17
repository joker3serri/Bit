import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { RadioButtonComponent } from "./radio-button.component";
import { RadioGroupComponent } from "./radio-group.component";

@NgModule({
  imports: [CommonModule],
  declarations: [RadioButtonComponent, RadioGroupComponent],
  exports: [RadioButtonComponent, RadioGroupComponent],
})
export class RadioButtonModule {}
