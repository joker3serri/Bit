import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TableModule } from "@bitwarden/components";

// eslint-disable-next-line no-restricted-imports
import { SharedModule } from "../../../shared/shared.module";
import { OrganizationBadgeModule } from "../../individual-vault/organization-badge/organization-badge.module";
import { PipesModule } from "../../individual-vault/pipes/pipes.module";
import { CollectionBadgeModule } from "../../org-vault/collection-badge/collection-badge.module";

import { VaultCipherRowComponent } from "./vault-cipher-row.component";
import { VaultCollectionRowComponent } from "./vault-collection-row.component";
import { VaultItemsComponent } from "./vault-items.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ScrollingModule,
    SharedModule,
    TableModule,
    OrganizationBadgeModule,
    CollectionBadgeModule,
    PipesModule,
  ],
  declarations: [VaultItemsComponent, VaultCipherRowComponent, VaultCollectionRowComponent],
  exports: [VaultItemsComponent],
})
export class VaultItemsModule {}
