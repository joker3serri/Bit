import { ServerConfigResponse } from "../../models/response/server-config-response";

import { EnvironmentServerConfig } from "./environment-server-config";
import { ThirdPartyServerConfig } from "./third-party-server-config";

export class ServerConfig {
  version: string;
  gitHash: string;
  server: ThirdPartyServerConfig; // should be null unless the client is pointing to a 3rd party server
  environment: EnvironmentServerConfig;
  utcDate: Date;

  constructor(serverConfigReponse?: ServerConfigResponse) {
    this.version = serverConfigReponse?.version;
    this.gitHash = serverConfigReponse?.gitHash;
    this.server = serverConfigReponse?.server;
    this.environment = serverConfigReponse?.environment ?? new EnvironmentServerConfig();
    this.utcDate = serverConfigReponse?.utcDate;
  }

  isValid(): boolean {
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
