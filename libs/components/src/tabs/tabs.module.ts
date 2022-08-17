import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TabGroupComponent } from "./tab-group.component";
import { TabComponent } from "./tab.component";

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [TabGroupComponent, TabComponent],
  declarations: [TabGroupComponent, TabComponent],
})
export class TabsModule {}
