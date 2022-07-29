import { NgModule } from "@angular/core";

import { VaultModule } from "../../vault/shared/vault.module";

import { OrganizationVaultRoutingModule } from "./organization-vault-routing.module";
import { OrganizationVaultComponent } from "./organization-vault.component";

@NgModule({
  imports: [VaultModule, OrganizationVaultRoutingModule],
  declarations: [OrganizationVaultComponent],
  exports: [OrganizationVaultComponent],
})
export class OrganizationVaultModule {}
