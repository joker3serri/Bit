import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared";

import { FilterComponent } from "../layout/filter.component";
import { HeaderComponent } from "../layout/header.component";
import { NewMenuComponent } from "../layout/new-menu.component";
import { ProjectDialogComponent } from "../projects/dialog/project-dialog.component";

import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretsListComponent } from "./secrets-list.component";
import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  imports: [SharedModule, SecretsRoutingModule],
  declarations: [
    SecretsComponent,
    SecretsListComponent,
    SecretDialogComponent,
    HeaderComponent,
    FilterComponent,
    NewMenuComponent,
    ProjectDialogComponent, // TODO: move to Project module upon merge with https://github.com/bitwarden/clients/pull/3508
  ],
  providers: [],
})
export class SecretsModule {}
