import { NgModule } from "@angular/core";

import { CoreAuthModule } from "./core";
import { AuthSettingsModule } from "./settings/settings.module";

@NgModule({
  imports: [CoreAuthModule, AuthSettingsModule],
  declarations: [],
  providers: [],
  exports: [AuthSettingsModule],
})
export class AuthModule {}
