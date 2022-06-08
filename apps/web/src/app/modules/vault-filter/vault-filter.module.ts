import { NgModule } from "@angular/core";

import { VaultFilterService } from "@bitwarden/angular/src/modules/vault-filter/vault-filter.service";
import { CipherService } from "@bitwarden/common/src/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/src/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/src/abstractions/folder.service";
import { OrganizationService } from "@bitwarden/common/src/abstractions/organization.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";

import { SharedModule } from "../shared.module";

import { CollectionFilterComponent } from "./components/collection-filter.component";
import { FolderFilterComponent } from "./components/folder-filter.component";
import { LinkSsoComponent } from "./components/link-sso.component";
import { OrganizationFilterComponent } from "./components/organization-filter.component";
import { OrganizationOptionsComponent } from "./components/organization-options.component";
import { StatusFilterComponent } from "./components/status-filter.component";
import { TypeFilterComponent } from "./components/type-filter.component";
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
    LinkSsoComponent,
  ],
  exports: [VaultFilterComponent],
  providers: [
    {
      provide: VaultFilterService,
      useClass: VaultFilterService,
      deps: [
        StateService,
        OrganizationService,
        FolderService,
        CipherService,
        CollectionService,
        PolicyService,
      ],
    },
  ],
})
export class VaultFilterModule {}
