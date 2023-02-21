import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { VaultItemsComponent } from "./vault-items.component";

@NgModule({
  imports: [CommonModule],
  declarations: [VaultItemsComponent],
  exports: [VaultItemsComponent],
})
export class VaultItemsModule {}
