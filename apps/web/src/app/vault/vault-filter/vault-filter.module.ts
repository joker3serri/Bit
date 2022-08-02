import { NgModule } from "@angular/core";

import { VaultFilterComponent as OrganizationVaultFilterComponent } from "../../organizations/vault/vault-filter/vault-filter.component";
import { SharedModule } from "../../shared/shared.module";

import { LinkSsoComponent } from "./organization-filter/link-sso.component";
import { OrganizationFilterComponent } from "./organization-filter/organization-filter.component";
import { OrganizationOptionsComponent } from "./organization-filter/organization-options.component";
import { CollectionFilterComponent } from "./shared/collection-filter/collection-filter.component";
import { FolderFilterComponent } from "./shared/folder-filter/folder-filter.component";
import { StatusFilterComponent } from "./shared/status-filter/status-filter.component";
import { TypeFilterComponent } from "./shared/type-filter/type-filter.component";
import { VaultFilterService } from "./shared/vault-filter.service";
import { VaultFilterComponent } from "./vault-filter.component";

@NgModule({
  imports: [SharedModule],
  declarations: [
    VaultFilterComponent,
    CollectionFilterComponent,
    FolderFilterComponent,
    OrganizationFilterComponent,
    OrganizationOptionsComponent,
    StatusFilterComponent,
    TypeFilterComponent,
    OrganizationVaultFilterComponent,
    LinkSsoComponent,
  ],
  exports: [VaultFilterComponent, OrganizationVaultFilterComponent],
  providers: [VaultFilterService],
})
export class VaultFilterModule {}
