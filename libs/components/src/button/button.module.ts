import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ButtonComponent, ButtonPrefixDirective, ButtonPrimaryDirective } from "./button.component";

@NgModule({
  imports: [CommonModule],
  exports: [ButtonComponent, ButtonPrimaryDirective, ButtonPrefixDirective], // etc
  declarations: [ButtonComponent, ButtonPrimaryDirective, ButtonPrefixDirective],
})
export class ButtonModule {}
