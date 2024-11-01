import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { ConfigService } from "../abstractions/config/config.service";
import { Settings } from "../models/domain/server-settings";

export class DefaultServerSettingsService {
  constructor(private configService: ConfigService) {}

  getSettings$(): Observable<Settings> {
    return this.configService.serverSettings$;
  }

  get isUserRegistrationDisabled$(): Observable<boolean> {
    return this.getSettings$().pipe(map((settings: Settings) => settings.disableUserRegistration));
  }
}
