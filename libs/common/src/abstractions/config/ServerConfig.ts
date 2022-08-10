import { EnvironmentServerConfig } from "./EnvironmentServerConfig";
import { ThirdPartyServerConfig } from "./ThirdPartyServerConfig";

export class ServerConfig {
  version: string;
  gitHash: string;
  server: ThirdPartyServerConfig; // should be null unless the client is pointing to a 3rd party server
  environment: EnvironmentServerConfig;
  utcDate: Date;

  constructor() {
    this.environment = new EnvironmentServerConfig();
  }
}
