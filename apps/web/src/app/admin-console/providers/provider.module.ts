import { NgModule } from "@angular/core";

import { HeaderModule } from "../../layouts/header/header.module";
import { SharedModule } from "../../shared";

import { ProvidersComponent } from "./providers.component";
import { VerifyRecoverDeleteProviderComponent } from "./verify-recover-delete-provider.component";

@NgModule({
  imports: [SharedModule, HeaderModule],
  declarations: [ProvidersComponent, VerifyRecoverDeleteProviderComponent],
})
export class ProviderModule {}
