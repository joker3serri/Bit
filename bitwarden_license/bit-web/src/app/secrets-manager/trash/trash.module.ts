import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { SecretDeletePermanentlyDialogComponent } from "./dialog/secret-delete-permanently.component";
import { SecretRestoreDialogComponent } from "./dialog/secret-restore.component";
import { TrashRoutingModule } from "./trash-routing.module";
import { TrashComponent } from "./trash.component";

@NgModule({
  imports: [SecretsManagerSharedModule, TrashRoutingModule],
  declarations: [
    SecretDeletePermanentlyDialogComponent,
    SecretRestoreDialogComponent,
    TrashComponent,
  ],
  providers: [],
})
export class TrashModule {}
