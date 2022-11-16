import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { CheckboxComponent } from "./checkbox.component";

@NgModule({
  imports: [SharedModule, CommonModule],
  declarations: [CheckboxComponent],
  exports: [CheckboxComponent],
})
export class CheckboxModule {}
