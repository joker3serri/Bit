import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IconModule } from "../icon";
import { SharedModule } from "../shared";

import { CheckboxComponent } from "./checkbox.component";

@NgModule({
  imports: [SharedModule, CommonModule, IconModule],
  declarations: [CheckboxComponent],
  exports: [CheckboxComponent],
})
export class CheckboxModule {}
