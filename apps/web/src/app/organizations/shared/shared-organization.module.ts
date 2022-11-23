import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared/shared.module";

import { AccessSelectorModule } from "./components/access-selector";
import { CollectionDialogModule } from "./components/collection-dialog";

@NgModule({
  imports: [SharedModule, CollectionDialogModule, AccessSelectorModule],
  exports: [SharedModule, CollectionDialogModule, AccessSelectorModule],
})
export class SharedOrganizationModule {}
