import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ButtonModule } from "../button";
import { FormButtonModule } from "../form-button";

import { SubmitButtonComponent } from "./submit-button.component";

@NgModule({
  imports: [CommonModule, ButtonModule, FormButtonModule],
  exports: [SubmitButtonComponent],
  declarations: [SubmitButtonComponent],
})
export class SubmitButtonModule {}
