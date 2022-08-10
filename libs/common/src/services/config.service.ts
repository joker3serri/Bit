import { Observable, Subject } from "rxjs";

import { ApiService } from "../abstractions/api.service";
import { ServerConfig } from "../abstractions/config/ServerConfig";
import { ConfigService as ConfigServiceAbstraction } from "../abstractions/config/config.service";
import { StateService } from "../abstractions/state.service";

export class ConfigService implements ConfigServiceAbstraction {
  private _serverConfig = new Subject<ServerConfig>();
  serverConfig$: Observable<ServerConfig> = this._serverConfig.asObservable();

  private readonly OneHourInMilliseconds: number = 3600000;
  private readonly TwentyFourHours: number = 24;

  constructor(private stateService: StateService, private apiService: ApiService) {
    this.getStateServiceServerConfig();
  }

  private async getStateServiceServerConfig(): Promise<void> {
    const currentUtcDate = new Date(new Date().toISOString());

    const stateServerConfig = await this.stateService.getServerConfig();
    if (this.isNullOrUndefined(stateServerConfig)) {
      await this.getApiServiceServerConfig();
    } else {
      // check if serverConfig is out of date
      if (
        this.getDateDiffInHours(currentUtcDate, stateServerConfig.utcDate) >= this.TwentyFourHours
      ) {
        this.getApiServiceServerConfig();
      } else {
        this._serverConfig.next(stateServerConfig);
      }
    }
  }

  private async getApiServiceServerConfig(): Promise<void> {
    const apiServerConfig = await this.apiService.getServerConfig();
    if (this.isNullOrUndefined(apiServerConfig)) {
      // begin retry / polling mechanism
    } else {
      this._serverConfig.next(apiServerConfig);
    }
  }

  private getDateDiffInHours(dateA: Date, dateB: Date) {
    return Math.abs(dateA.getTime() - dateB.getTime()) / this.OneHourInMilliseconds;
  }

  private isNullOrUndefined(value: any) {
    return value == null || value == undefined;
  }
}
