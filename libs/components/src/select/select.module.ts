import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgSelectModule } from "@ng-select/ng-select";

import { OptionComponent } from "./option.component";
import { SelectComponent } from "./select.component";

@NgModule({
  imports: [CommonModule, NgSelectModule],
  declarations: [SelectComponent, OptionComponent],
  exports: [SelectComponent, OptionComponent],
})
export class SelectModule {}
