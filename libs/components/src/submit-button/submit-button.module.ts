import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ButtonModule } from "src/button";

import { SubmitButtonComponent } from "./submit-button.component";

@NgModule({
  imports: [CommonModule, ButtonModule],
  exports: [SubmitButtonComponent],
  declarations: [SubmitButtonComponent],
})
export class SubmitButtonModule {}
