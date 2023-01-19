import { NgModule } from "@angular/core";

import { MultiSelectModule } from "@bitwarden/components";
import { ProductSwitcherModule } from "@bitwarden/web-vault/app/layouts/product-switcher/product-switcher.module";
import { CoreOrganizationModule } from "@bitwarden/web-vault/app/organizations/core";
import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { BulkStatusDialogComponent } from "../layout/dialogs/bulk-status-dialog.component";
import { HeaderComponent } from "../layout/header.component";
import { NewMenuComponent } from "../layout/new-menu.component";
import { NoItemsComponent } from "../layout/no-items.component";

import { AccessPoliciesComponent } from "./access-policies/access-policies.component";
import { AccessSelectorComponent } from "./access-policies/access-selector.component";
import { SaAccessSelectorComponent } from "./access-policies/sa-access-selector.component";
import { SecretsListComponent } from "./secrets-list.component";

@NgModule({
  imports: [SharedModule, ProductSwitcherModule, MultiSelectModule, CoreOrganizationModule],
  exports: [
    SharedModule,
    BulkStatusDialogComponent,
    HeaderComponent,
    NewMenuComponent,
    NoItemsComponent,
    SecretsListComponent,
    AccessPoliciesComponent,
    AccessSelectorComponent,
    SaAccessSelectorComponent,
  ],
  declarations: [
    BulkStatusDialogComponent,
    HeaderComponent,
    NewMenuComponent,
    NoItemsComponent,
    SecretsListComponent,
    AccessPoliciesComponent,
    AccessSelectorComponent,
    SaAccessSelectorComponent,
  ],
  providers: [],
  bootstrap: [],
})
export class SecretsManagerSharedModule {}
