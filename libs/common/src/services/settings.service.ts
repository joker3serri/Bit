import { BehaviorSubject, map, Observable } from "rxjs";

import { SettingsService as SettingsServiceAbstraction } from "../abstractions/settings.service";
import { StateService } from "../abstractions/state.service";
import { Utils } from "../misc/utils";

const Keys = {
  settingsPrefix: "settings_",
  equivalentDomains: "equivalentDomains",
};

export class SettingsService implements SettingsServiceAbstraction {
  private _settings: BehaviorSubject<any> = new BehaviorSubject([]);

  settings$ = this._settings.asObservable();

  constructor(private stateService: StateService) {
    this.stateService.activeAccountUnlocked$.subscribe(async (unlocked) => {
      if ((Utils.global as any).bitwardenContainerService == null) {
        return;
      }

      if (!unlocked) {
        this._settings.next([]);
        return;
      }

      const data = await this.stateService.getSettings();

      this._settings.next(data);
    });
  }

  getEquivalentDomains$(): Observable<any> {
    return this.getSettingsKey$(Keys.equivalentDomains);
  }

  async setEquivalentDomains(equivalentDomains: string[][]): Promise<void> {
    await this.setSettingsKey(Keys.equivalentDomains, equivalentDomains);
  }

  async clear(userId?: string): Promise<void> {
    if (userId == null || userId == (await this.stateService.getUserId())) {
      this._settings.next([]);
    }

    await this.stateService.setSettings(null, { userId: userId });
  }

  // Helpers

  private getSettingsKey$(key: string): Observable<any> {
    const result: Observable<any> = this._settings.pipe(
      map((settings) => {
        if (settings != null && settings[key]) {
          return settings[key];
        }
        return null;
      })
    );

    return result;
  }

  private async setSettingsKey(key: string, value: any): Promise<void> {
    let settings = this._settings.getValue();
    if (!settings) {
      settings = {};
    }

    settings[key] = value;

    this._settings.next(settings);
    await this.stateService.setSettings(settings);
  }
}
