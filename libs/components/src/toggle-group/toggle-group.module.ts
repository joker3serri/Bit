import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { BadgeModule } from "../badge";

import { ToggleGroupElementComponent } from "./toggle-group-element.component";
import { ToggleGroupComponent } from "./toggle-group.component";

@NgModule({
  imports: [CommonModule, BadgeModule],
  exports: [ToggleGroupComponent, ToggleGroupElementComponent],
  declarations: [ToggleGroupComponent, ToggleGroupElementComponent],
})
export class ToggleGroupModule {}
