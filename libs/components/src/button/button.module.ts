import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ButtonComponent } from "./button.component";
import {
  ButtonPrimaryDirective,
  ButtonSecondaryDirective,
  ButtonDangerDirective,
} from "./button-style.directive";

@NgModule({
  imports: [CommonModule],
  exports: [
    ButtonComponent,
    ButtonPrimaryDirective,
    ButtonSecondaryDirective,
    ButtonDangerDirective,
  ],
  declarations: [
    ButtonComponent,
    ButtonPrimaryDirective,
    ButtonSecondaryDirective,
    ButtonDangerDirective,
  ],
})
export class ButtonModule {}
