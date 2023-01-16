import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { SMExportComponent } from "./export/sm-export.component";
import { SMExportService } from "./export/sm-export.service";
import { SMImportComponent } from "./import/sm-import.component";
import { SettingsRoutingModule } from "./settings-routing.module";

@NgModule({
  imports: [SecretsManagerSharedModule, SettingsRoutingModule],
  declarations: [SMImportComponent, SMExportComponent],
  providers: [SMExportService],
})
export class SettingsModule {}
