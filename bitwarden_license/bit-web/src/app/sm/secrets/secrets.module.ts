import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { TableModule } from "@bitwarden/components";

import { SharedModule } from "src/app/modules/shared.module";

import { SecretsListComponent } from "./secrets-list.component";
import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  imports: [CommonModule, SharedModule, SecretsRoutingModule, TableModule],
  declarations: [SecretsComponent, SecretsListComponent],
  providers: [],
})
export class SecretsModule {}
