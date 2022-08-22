import { concatMap, Observable, Subject } from "rxjs";

import { ConfigApiServiceAbstraction as ConfigApiService } from "../../abstractions/config/config-api.service.abstraction";
import { ConfigService as ConfigServiceAbstraction } from "../../abstractions/config/config.service";
import { ServerConfig } from "../../abstractions/config/serverConfig";
import { StateService } from "../../abstractions/state.service";


export class ConfigService implements ConfigServiceAbstraction {
  private _serverConfig = new Subject<ServerConfig>();
  serverConfig$: Observable<ServerConfig> = this._serverConfig.asObservable();

  constructor(private stateService: StateService, private configApiService: ConfigApiService) {
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
      return await this.pollServerConfig();
    } else {
      return storedServerConfig;
    }
  }

  private async pollServerConfig(): Promise<ServerConfig> {
    const apiServerConfig = await this.configApiService.get();
    const serverConfig = new ServerConfig(apiServerConfig);

    if (serverConfig == null) {
      // begin retry / polling mechanism
    } else {
      await this.stateService.setServerConfig(serverConfig);
      return serverConfig;
    }
  }
}
