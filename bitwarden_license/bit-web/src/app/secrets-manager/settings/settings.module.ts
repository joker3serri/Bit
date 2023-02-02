import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { SMImportErrorDialogComponent } from "./dialog/sm-import-error-dialog.component";
import { SMExportComponent } from "./porting/sm-export.component";
import { SMImportComponent } from "./porting/sm-import.component";
import { SMPortingService } from "./porting/sm-porting.service";
import { SettingsRoutingModule } from "./settings-routing.module";

@NgModule({
  imports: [SecretsManagerSharedModule, SettingsRoutingModule],
  declarations: [SMImportComponent, SMExportComponent, SMImportErrorDialogComponent],
  providers: [SMPortingService],
})
export class SettingsModule {}
