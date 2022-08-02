import { NgModule } from "@angular/core";

import { VaultSharedModule } from "../../vault/shared/vault-shared.module";

import { OrganizationVaultRoutingModule } from "./organization-vault-routing.module";
import { OrganizationVaultComponent } from "./organization-vault.component";

@NgModule({
  imports: [VaultSharedModule, OrganizationVaultRoutingModule],
  declarations: [OrganizationVaultComponent],
  exports: [OrganizationVaultComponent],
})
export class OrganizationVaultModule {}
