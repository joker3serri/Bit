import { Observable, Subject } from "rxjs";

import { ApiService } from "../abstractions/api.service";
import { ServerConfig } from "../abstractions/config/ServerConfig";
import { ConfigService as ConfigServiceAbstraction } from "../abstractions/config/config.service";
import { StateService } from "../abstractions/state.service";

export class ConfigService implements ConfigServiceAbstraction {
  private _serverConfig = new Subject<ServerConfig>();
  serverConfig$: Observable<ServerConfig> = this._serverConfig.asObservable();

  constructor(private stateService: StateService, private apiService: ApiService) {
    this.stateService.activeAccountUnlocked$.subscribe(async (unlocked) => {
      if (!unlocked) {
        this._serverConfig.next(null);
        return;
      }

      this._serverConfig.next(await this.buildServerConfig());
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
    const apiServerConfig = await this.apiService.getServerConfig();
    if (apiServerConfig == null) {
      // begin retry / polling mechanism
    } else {
      return apiServerConfig;
    }
  }
}
