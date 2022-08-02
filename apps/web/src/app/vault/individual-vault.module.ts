import { NgModule } from "@angular/core";

import { IndividualVaultRoutingModule } from "./individual-vault-routing.module";
import { IndividualVaultComponent } from "./individual-vault.component";
import { VaultSharedModule } from "./shared/vault-shared.module";

@NgModule({
  imports: [VaultSharedModule, IndividualVaultRoutingModule],
  declarations: [IndividualVaultComponent],
  exports: [IndividualVaultComponent],
})
export class IndividualVaultModule {}
