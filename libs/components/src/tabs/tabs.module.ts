import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TabGroupComponent } from "./tab-group.component";
import { TabLabelDirective } from "./tab-label.directive";
import { TabComponent } from "./tab.component";

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [TabGroupComponent, TabComponent, TabLabelDirective],
  declarations: [TabGroupComponent, TabComponent, TabLabelDirective],
})
export class TabsModule {}
