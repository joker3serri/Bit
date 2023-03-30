import { NgModule } from "@angular/core";

import { SearchModule } from "@bitwarden/components";

import { AccessSelectorModule } from "../../admin-console/organizations/shared/components/access-selector/access-selector.module";
import { CollectionDialogModule } from "../../admin-console/organizations/shared/components/collection-dialog";
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  imports: [SharedModule, CollectionDialogModule, AccessSelectorModule, SearchModule],
  declarations: [],
  exports: [SharedModule, CollectionDialogModule, AccessSelectorModule, SearchModule],
})
export class SharedOrganizationModule {}
