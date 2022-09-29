import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared";

import { SecretsSharedModule } from "../shared/sm-shared.module";

import { ServiceAccountsListComponent } from "./service-accounts-list.component";
import { ServiceAccountsRoutingModule } from "./service-accounts-routing.module";
import { ServiceAccountsComponent } from "./service-accounts.component";

@NgModule({
  imports: [SharedModule, ServiceAccountsRoutingModule, SecretsSharedModule],
  declarations: [ServiceAccountsComponent, ServiceAccountsListComponent],
  providers: [],
})
export class ServiceAccountsModule {}
