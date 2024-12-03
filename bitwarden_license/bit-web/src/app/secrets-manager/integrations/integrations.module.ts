import { NgModule } from "@angular/core";

import { SharedIntegrationsModule } from "@bitwarden/web-vault/app/shared/components/integrations/integrations.module";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { IntegrationsRoutingModule } from "./integrations-routing.module";
import { IntegrationsComponent } from "./integrations.component";

@NgModule({
  imports: [SecretsManagerSharedModule, IntegrationsRoutingModule, SharedIntegrationsModule],
  declarations: [IntegrationsComponent],
  providers: [],
})
export class IntegrationsModule {}
