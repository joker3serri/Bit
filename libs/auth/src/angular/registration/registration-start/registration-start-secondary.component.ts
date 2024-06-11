import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ClientType } from "@bitwarden/common/enums";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

const LOGIN_ROUTE_BY_CLIENT_TYPE: Partial<Record<ClientType, string>> = {
  [ClientType.Web]: "/login",
  [ClientType.Desktop]: "/login",
  [ClientType.Browser]: "/home",
};

@Component({
  standalone: true,
  selector: "auth-registration-start-secondary",
  templateUrl: "./registration-start-secondary.component.html",
  imports: [CommonModule, JslibModule, RouterModule],
})
export class RegistrationStartSecondaryComponent {
  loginRoute: string;

  constructor(platformUtilsService: PlatformUtilsService) {
    this.loginRoute = LOGIN_ROUTE_BY_CLIENT_TYPE[platformUtilsService.getClientType()];
  }
}
