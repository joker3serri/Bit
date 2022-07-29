import { NgModule } from "@angular/core";

import { VaultFilterModule } from "../../modules/vault-filter/vault-filter.module";
import { LooseComponentsModule } from "../../shared/loose-components.module";
import { SharedModule } from "../../shared/shared.module";

import { VaultService } from "./vault.service";

@NgModule({
  imports: [SharedModule, VaultFilterModule, LooseComponentsModule],
  exports: [SharedModule, VaultFilterModule, LooseComponentsModule],
  providers: [
    {
      provide: VaultService,
      useClass: VaultService,
    },
  ],
})
export class VaultModule {}
