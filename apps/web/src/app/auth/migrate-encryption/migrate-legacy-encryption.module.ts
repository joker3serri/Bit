import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared";

import { MigrateFromLegacyEncryptionComponent } from "./migrate-legacy-encryption.component";
import { MigrateFromLegacyEncryptionService } from "./migrate-legacy-encryption.service";

@NgModule({
  imports: [SharedModule],
  declarations: [MigrateFromLegacyEncryptionComponent],
  providers: [MigrateFromLegacyEncryptionService],
})
export class MigrateLegacyEncryptionModule {}
