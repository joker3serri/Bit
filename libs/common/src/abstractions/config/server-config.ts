import { ServerConfigResponse } from "../../models/response/server-config-response";

export class ServerConfig {
  version: string;
  gitHash: string;
  server: ThirdPartyServerConfig; // should be null unless the client is pointing to a 3rd party server
  environment: EnvironmentServerConfig;
  utcDate: Date;

  constructor(serverConfigReponse?: ServerConfigResponse) {
    if (serverConfigReponse == null) {
      return;
    }

    this.version = serverConfigReponse?.version;
    this.gitHash = serverConfigReponse?.gitHash;
    this.server = serverConfigReponse?.server;
    this.utcDate = serverConfigReponse?.utcDate;
    this.environment = serverConfigReponse?.environment ?? new EnvironmentServerConfig();

    if (serverConfigReponse?.server?.name == null || serverConfigReponse?.server?.url == null) {
      this.server = null;
    }
  }

  isValid(): boolean {
    if (
      this.utcDate == null ||
      (this.version == null &&
        this.gitHash == null &&
        this.server == null &&
        this.environment == null)
    ) {
      return false;
    }

    const twentyFourHours = 24;
    const currentUtcDate = new Date(new Date().toISOString());
    return this.getDateDiffInHours(currentUtcDate, this.utcDate) < twentyFourHours;
  }

  private getDateDiffInHours(dateA: Date, dateB: Date): number {
    const oneHourInMs = 3600000;
    return Math.abs(dateA.getTime() - dateB.getTime()) / oneHourInMs;
  }

  static fromJSON(json: any): ServerConfig {
    const utcDate = json?.utcDate == null ? null : new Date(json.utcDate);
    return Object.assign(new ServerConfig(), json, { utcDate });
  }
}

export class ThirdPartyServerConfig {
  name: string;
  url: string;
}

export class EnvironmentServerConfig {
  vault: string;
  api: string;
  identity: string;
  admin: string;
  notifications: string;
  sso: string;
}
