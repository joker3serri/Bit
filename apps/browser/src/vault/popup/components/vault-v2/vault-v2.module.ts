import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { AutofillVaultListItemsComponent } from "./autofill-vault-list-items/autofill-vault-list-items.component";
import { VaultListItemComponent } from "./vault-list-item/vault-list-item.component";
import { VaultListItemsContainerComponent } from "./vault-list-items-container/vault-list-items-container.component";

@NgModule({
  imports: [
    CommonModule,
    AutofillVaultListItemsComponent,
    VaultListItemComponent,
    VaultListItemsContainerComponent,
  ],
  declarations: [],
  exports: [
    AutofillVaultListItemsComponent,
    VaultListItemComponent,
    VaultListItemsContainerComponent,
  ],
})
export class VaultV2Module {}
