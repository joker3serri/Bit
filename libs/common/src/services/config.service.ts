import { ConfigService as ConfigServiceAbstraction } from "../abstractions/config.service";
import { StateService } from "../abstractions/state.service";
import { Config } from "../models/domain/config";

export class ConfigService implements ConfigServiceAbstraction {
  constructor(private stateService: StateService) {}

  async getConfig(): Promise<Config> {
    return await this.stateService.getConfig();
  }
}
