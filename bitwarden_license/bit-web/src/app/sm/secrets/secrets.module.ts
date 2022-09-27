import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";

import { FilterComponent } from "../layout/filter.component";
import { HeaderComponent } from "../layout/header.component";
import { NewMenuComponent } from "../layout/new-menu.component";
import { ProjectDialogComponent } from "../projects/dialog/project-dialog.component";
import { SecretsSharedModule } from "../shared/sm-shared.module";
import { SecretDeleteDialogComponent } from "./dialog/secret-delete.component";
import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretsListComponent } from "./secrets-list.component";
import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  imports: [SharedModule, SecretsRoutingModule, SecretsSharedModule],
  declarations: [
    SecretsComponent,
    SecretsListComponent,
    SecretDialogComponent,
    SecretDeleteDialogComponent,
  ],
  providers: [],
})
export class SecretsModule {}
