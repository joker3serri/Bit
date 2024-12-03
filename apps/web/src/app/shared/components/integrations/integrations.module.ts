import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "../../loose-components.module";
import { SharedModule } from "../../shared.module";

import { IntegrationCardComponent } from "./integration-card/integration-card.component";
import { IntegrationGridComponent } from "./integration-grid/integration-grid.component";

@NgModule({
  imports: [SharedModule, CommonModule, LooseComponentsModule],
  declarations: [IntegrationGridComponent, IntegrationCardComponent],
  exports: [IntegrationGridComponent, IntegrationCardComponent],
})
export class SharedIntegrationsModule {}
