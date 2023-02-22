import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TableModule } from "@bitwarden/components";

// eslint-disable-next-line no-restricted-imports
import { SharedModule } from "../../../app/shared/shared.module";

import { VaultCollectionRowComponent } from "./vault-collection-row.component";
import { VaultItemRowComponent } from "./vault-item-row.component";
import { VaultItemsComponent } from "./vault-items.component";

@NgModule({
  imports: [CommonModule, RouterModule, TableModule, SharedModule],
  declarations: [VaultItemsComponent, VaultItemRowComponent, VaultCollectionRowComponent],
  exports: [VaultItemsComponent],
})
export class VaultItemsModule {}
