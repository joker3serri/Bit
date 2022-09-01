import { BehaviorSubject, concatMap } from "rxjs";

import { ServerConfigData } from "@bitwarden/common/models/data/server-config.data";

import { ConfigApiServiceAbstraction } from "../../abstractions/config/config-api.service.abstraction";
import { ConfigServiceAbstraction } from "../../abstractions/config/config.service.abstraction";
import { ServerConfig } from "../../abstractions/config/server-config";
import { StateService } from "../../abstractions/state.service";

export class ConfigService implements ConfigServiceAbstraction {
  private _serverConfig = new BehaviorSubject<ServerConfig | null>(null);
  serverConfig$ = this._serverConfig.asObservable();

  constructor(
    private stateService: StateService,
    private configApiService: ConfigApiServiceAbstraction
  ) {
    this.stateService.activeAccountUnlocked$
      .pipe(
        concatMap(async (unlocked) => {
          if (!unlocked) {
            this._serverConfig.next(null);
            return;
          }

          const serverConfig = await this.buildServerConfig();

          return serverConfig;
        })
      )
      .subscribe((serverConfig) => {
        this._serverConfig.next(serverConfig);
      });
  }

  private async buildServerConfig(): Promise<ServerConfig> {
    const data = await this.stateService.getServerConfig();
    const domain = data ? new ServerConfig(data) : null;

    if (domain == null || !domain.isValid()) {
      const value = await this.fetchServerConfig();
      return value ?? domain;
    }

    return domain;
  }

  private async fetchServerConfig(): Promise<ServerConfig> {
    const response = await this.configApiService.get();
    const data = new ServerConfigData(response);

    if (data != null) {
      await this.stateService.setServerConfig(data);
      return new ServerConfig(data);
    }

    return null;
  }
}
