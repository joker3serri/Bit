import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { BulkStatusDialogComponent } from "../layout/dialogs/bulk-status-dialog.component";
import { ExpirationOptionsComponent } from "../layout/expiration-options.component";
import { FilterComponent } from "../layout/filter.component";
import { HeaderComponent } from "../layout/header.component";
import { NewMenuComponent } from "../layout/new-menu.component";
import { NoItemsComponent } from "../layout/no-items.component";

@NgModule({
  imports: [SharedModule],
  exports: [
    SharedModule,
    BulkStatusDialogComponent,
    FilterComponent,
    HeaderComponent,
    ExpirationOptionsComponent,
    NewMenuComponent,
    NoItemsComponent,
  ],
  declarations: [
    BulkStatusDialogComponent,
    FilterComponent,
    HeaderComponent,
    ExpirationOptionsComponent,
    NewMenuComponent,
    NoItemsComponent,
  ],
  providers: [],
  bootstrap: [],
})
export class SecretsManagerSharedModule {}
