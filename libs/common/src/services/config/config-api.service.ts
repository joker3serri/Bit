import { ApiService } from "../../abstractions/api.service";
import { ConfigApiServiceAbstraction as ConfigApiServiceAbstraction } from "../../abstractions/config/config-api.service.abstraction";
import { AuthService } from "../../auth/abstractions/auth.service";
import { AuthenticationStatus } from "../../auth/enums/authentication-status";
import { ServerConfigResponse } from "../../models/response/server-config.response";

export class ConfigApiService implements ConfigApiServiceAbstraction {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  async get(): Promise<ServerConfigResponse> {
    let authed = false;
    const authStatus: AuthenticationStatus = await this.authService.getAuthStatus();
    if (authStatus !== AuthenticationStatus.LoggedOut) {
      authed = true;
    }

    const r = await this.apiService.send("GET", "/config", null, authed, true);
    return new ServerConfigResponse(r);
  }
}
