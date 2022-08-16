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

  isValid(): boolean {
    const twentyFourHours = 24;
    const currentUtcDate = new Date(new Date().toISOString());
    return this.getDateDiffInHours(currentUtcDate, this.utcDate) < twentyFourHours;
  }

  private getDateDiffInHours(dateA: Date, dateB: Date): number {
    const oneHourInMs = 3600000;
    return Math.abs(dateA.getTime() - dateB.getTime()) / oneHourInMs;
  }
}
