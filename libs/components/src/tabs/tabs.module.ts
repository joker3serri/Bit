import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TabBodyComponent } from "./tab-body.component";
import { TabGroupComponent } from "./tab-group.component";
import { TabLabelDirective } from "./tab-label.directive";
import { TabLinkComponent } from "./tab-link.component";
import { TabListContainerDirective } from "./tab-list-container.directive";
import { TabListItemDirective } from "./tab-list-item.directive";
import { TabNavBarComponent } from "./tab-nav-bar.component";
import { TabComponent } from "./tab.component";

@NgModule({
  imports: [CommonModule, RouterModule, PortalModule],
  exports: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabNavBarComponent,
    TabLinkComponent,
  ],
  declarations: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabListContainerDirective,
    TabListItemDirective,
    TabNavBarComponent,
    TabLinkComponent,
    TabBodyComponent,
  ],
})
export class TabsModule {}
