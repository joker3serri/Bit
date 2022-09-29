import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared";

import { EmptyListComponent } from "../layout/empty-list.component";
import { FilterComponent } from "../layout/filter.component";
import { HeaderComponent } from "../layout/header.component";
import { NewMenuComponent } from "../layout/new-menu.component";

@NgModule({
  imports: [SharedModule],
  exports: [HeaderComponent, FilterComponent, NewMenuComponent, EmptyListComponent, SharedModule],
  declarations: [HeaderComponent, FilterComponent, NewMenuComponent, EmptyListComponent],
  providers: [],
  bootstrap: [],
})
export class SecretsSharedModule {}
