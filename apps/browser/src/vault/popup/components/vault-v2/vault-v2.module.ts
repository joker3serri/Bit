import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { AutofillVaultListItemsComponent } from "./autofill-vault-list-items/autofill-vault-list-items.component";
import { VaultListItemsContainerComponent } from "./vault-list-items-container/vault-list-items-container.component";

@NgModule({
  imports: [CommonModule, AutofillVaultListItemsComponent, VaultListItemsContainerComponent],
  declarations: [],
  exports: [AutofillVaultListItemsComponent, VaultListItemsContainerComponent],
})
export class VaultV2Module {}
