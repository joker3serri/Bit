import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared/shared.module";

import { LoginWithDeviceComponent } from "./login-with-device.component";
import { LoginComponent } from "./login.component";

@NgModule({
  imports: [SharedModule],
  declarations: [LoginComponent, LoginWithDeviceComponent],
  exports: [LoginComponent, LoginWithDeviceComponent],
})
export class LoginModule {}
