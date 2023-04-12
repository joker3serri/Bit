import { NgModule } from "@angular/core";

import { SelectModule } from "../../../../../../libs/components/src/select/select.module";
import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { SecretDeleteDialogComponent } from "./dialog/secret-delete.component";
import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretsRoutingModule } from "./secrets-routing.module";
import { SecretsComponent } from "./secrets.component";

@NgModule({
  declarations: [SecretDeleteDialogComponent, SecretDialogComponent, SecretsComponent],
  providers: [],
  imports: [SecretsManagerSharedModule, SecretsRoutingModule, SelectModule],
})
export class SecretsModule {}
