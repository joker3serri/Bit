import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LooseComponentsModule, SharedIntegrationsModule } from "../../../shared";
import { SharedOrganizationModule } from "../shared";

import { IntegrationsRoutingModule } from "./integrations-routing.module";
import { IntegrationsComponent } from "./integrations.component";

@NgModule({
  imports: [
    IntegrationsRoutingModule,
    CommonModule,
    SharedOrganizationModule,
    SharedIntegrationsModule,
    LooseComponentsModule,
  ],
  declarations: [IntegrationsComponent],
})
export class IntegrationsModule {}
