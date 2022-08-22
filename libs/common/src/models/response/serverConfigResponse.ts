import { BaseResponse } from "./baseResponse";

export class ServerConfigResponse extends BaseResponse {
  version: string;
  gitHash: string;
  server: ThirdPartyServerConfigApi; // should be null unless the client is pointing to a 3rd party server
  environment: EnvironmentServerConfigApi;
  utcDate: Date;

  constructor(response: any) {
    super(response);

    this.version = this.getResponseProperty("Version");
    this.gitHash = this.getResponseProperty("GitHash");
    this.server = new ThirdPartyServerConfigApi(this.getResponseProperty("Server"));
    this.environment = new EnvironmentServerConfigApi(this.getResponseProperty("Environment"));
    this.utcDate = new Date(this.getResponseProperty("UtcDate"));
  }
}

export class EnvironmentServerConfigApi extends BaseResponse {
  vault: string;
  api: string;
  identity: string;
  admin: string;
  notifications: string;
  sso: string;

  constructor(data: any = null) {
    super(data);

    if (data == null) {
      return;
    }

    this.vault = this.getResponseProperty("Vault");
    this.api = this.getResponseProperty("Api");
    this.identity = this.getResponseProperty("Identity");
    this.admin = this.getResponseProperty("Admin");
    this.notifications = this.getResponseProperty("Notifications");
    this.sso = this.getResponseProperty("Sso");
  }
}

export class ThirdPartyServerConfigApi extends BaseResponse {
  name: string;
  url: string;

  constructor(data: any = null) {
    super(data);

    if (data == null) {
      return;
    }

    this.name = this.getResponseProperty("Name");
    this.url = this.getResponseProperty("Url");
  }
}
