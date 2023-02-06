import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { LoginComponent } from "../../../auth/login.component";
import { SharedModule } from "../../shared/shared.module";

import { LoginWithDeviceComponent } from "./login-with-device.component";

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [LoginComponent, LoginWithDeviceComponent],
  exports: [LoginComponent, LoginWithDeviceComponent],
})
export class LoginModule {}
