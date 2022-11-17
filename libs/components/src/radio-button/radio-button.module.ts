import { NgModule } from "@angular/core";

import { RadioButtonComponent } from "./radio-button.component";
import { RadioGroupComponent } from "./radio-group.component";

@NgModule({
  imports: [],
  declarations: [RadioButtonComponent, RadioGroupComponent],
  exports: [RadioButtonComponent, RadioGroupComponent],
})
export class RadioButtonModule {}
