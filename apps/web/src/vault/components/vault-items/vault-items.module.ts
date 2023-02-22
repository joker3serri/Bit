import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TableModule } from "@bitwarden/components";

// eslint-disable-next-line no-restricted-imports
import { SharedModule } from "../../../app/shared/shared.module";

import { VaultItemsComponent } from "./vault-items.component";

@NgModule({
  imports: [CommonModule, RouterModule, TableModule, SharedModule],
  declarations: [VaultItemsComponent],
  exports: [VaultItemsComponent],
})
export class VaultItemsModule {}
