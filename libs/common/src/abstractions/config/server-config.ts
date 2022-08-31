import {
  ServerConfigData,
  ThirdPartyServerConfigData,
  EnvironmentServerConfigData,
} from "@bitwarden/common/models/data/server-config.data";

const MillisecondPerDay = 24 * 3600 * 1000;

export class ServerConfig {
  version: string;
  gitHash: string;
  server?: ThirdPartyServerConfigData;
  environment?: EnvironmentServerConfigData;
  utcDate: Date;

  constructor(serverConfigData: ServerConfigData) {
    this.version = serverConfigData.version;
    this.gitHash = serverConfigData.gitHash;
    this.server = serverConfigData.server;
    this.utcDate = new Date(serverConfigData.utcDate);
    this.environment = serverConfigData.environment;
  }

  isValid(): boolean {
    const diff = new Date().getTime() - this.utcDate?.getTime();

    return diff <= MillisecondPerDay;
  }
}
