import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { BadgeModule, ButtonModule, TableModule, MenuModule } from "@bitwarden/components";

import { SecretsListComponent } from "./secrets-list.component";
import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  imports: [CommonModule, SecretsRoutingModule, ButtonModule, TableModule, BadgeModule, MenuModule],
  declarations: [SecretsComponent, SecretsListComponent],
  providers: [],
})
export class SecretsModule {}
