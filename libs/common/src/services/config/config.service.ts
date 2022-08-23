import { concatMap, Observable, Subject } from "rxjs";

import { ConfigApiServiceAbstraction } from "../../abstractions/config/config-api.service.abstraction";
import { ConfigServiceAbstraction } from "../../abstractions/config/config.service.abstraction";
import { ServerConfig } from "../../abstractions/config/server-config";
import { StateService } from "../../abstractions/state.service";

export class ConfigService implements ConfigServiceAbstraction {
  private _serverConfig = new Subject<ServerConfig>();
  serverConfig$: Observable<ServerConfig> = this._serverConfig.asObservable();

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
    const storedServerConfig = await this.stateService.getServerConfig();

    if (storedServerConfig == null || !storedServerConfig.isValid()) {
      const value = this.fetchServerConfig();

      if (value != null) {
        return value ?? storedServerConfig;
      }
    } else {
      return storedServerConfig;
    }
  }

  private async fetchServerConfig(): Promise<ServerConfig> {
    const apiServerConfig = await this.configApiService.get();
    const serverConfig = new ServerConfig(apiServerConfig);

    if (serverConfig != null) {
      await this.stateService.setServerConfig(serverConfig);
      return serverConfig;
    }

    return null;
  }
}
