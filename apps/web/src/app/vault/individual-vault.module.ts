import { NgModule } from "@angular/core";

import { IndividualVaultRoutingModule } from "./individual-vault-routing.module";
import { IndividualVaultComponent } from "./individual-vault.component";
import { VaultModule } from "./shared/vault.module";

@NgModule({
  imports: [VaultModule, IndividualVaultRoutingModule],
  declarations: [IndividualVaultComponent],
  exports: [IndividualVaultComponent],
})
export class IndividualVaultModule {}
