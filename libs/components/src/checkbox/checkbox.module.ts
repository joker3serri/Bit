import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IconModule } from "../icon";
import { SharedModule } from "../shared";

import { CheckboxControlComponent } from "./checkbox-control.component";
import { CheckboxComponent } from "./checkbox.component";

@NgModule({
  imports: [SharedModule, CommonModule, IconModule],
  declarations: [CheckboxComponent, CheckboxControlComponent],
  exports: [CheckboxComponent, CheckboxControlComponent],
})
export class CheckboxModule {}
