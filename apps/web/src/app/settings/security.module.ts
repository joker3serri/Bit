import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { ChangeKdfConfirmationComponent } from "./change-kdf-confirmation.component";
import { ChangeKdfComponent } from "./change-kdf.component";
import { SecurityKeysComponent } from "./security-keys.component";
import { SecurityComponent } from "./security.component";

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    ChangeKdfComponent,
    ChangeKdfConfirmationComponent,
    SecurityKeysComponent,
    SecurityComponent,
  ],
  exports: [
    ChangeKdfComponent,
    ChangeKdfConfirmationComponent,
    SecurityKeysComponent,
    SecurityComponent,
  ],
})
export class SecurityModule {}
