import { Observable, Subject } from "rxjs";

import { ApiService } from "../abstractions/api.service";
import { ServerConfig } from "../abstractions/config/ServerConfig";
import { ConfigService as ConfigServiceAbstraction } from "../abstractions/config/config.service";
import { StateService } from "../abstractions/state.service";

export class ConfigService implements ConfigServiceAbstraction {
  private _serverConfig = new Subject<ServerConfig>();
  serverConfig$: Observable<ServerConfig> = this._serverConfig.asObservable();

  constructor(private stateService: StateService, private apiService: ApiService) {
    this.buildServerConfig();
  }

  private async buildServerConfig(): Promise<void> {
    const storedServerConfig = await this.stateService.getServerConfig();
    if (storedServerConfig == null || !storedServerConfig.isValid()) {
      await this.getApiServiceServerConfig();
    } else {
      this._serverConfig.next(storedServerConfig);
    }
  }

  private async getApiServiceServerConfig(): Promise<void> {
    const apiServerConfig = await this.apiService.getServerConfig();
    if (apiServerConfig == null) {
      // begin retry / polling mechanism
    } else {
      this._serverConfig.next(apiServerConfig);
    }
  }
}
