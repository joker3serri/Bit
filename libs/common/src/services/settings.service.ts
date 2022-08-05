import { BehaviorSubject } from "rxjs";

import { SettingsService as SettingsServiceAbstraction } from "../abstractions/settings.service";
import { StateService } from "../abstractions/state.service";
import { Utils } from "../misc/utils";
import { AccountSettings } from "../models/domain/account";

const Keys = {
  settingsPrefix: "settings_",
  equivalentDomains: "equivalentDomains",
};

export class SettingsService implements SettingsServiceAbstraction {
  private _settings: BehaviorSubject<AccountSettings[]> = new BehaviorSubject([]);

  settings$ = this._settings.asObservable();

  constructor(private stateService: StateService) {
    this.stateService.activeAccountUnlocked.subscribe(async (unlocked) => {
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

  getEquivalentDomains(): Promise<any> {
    return this.getSettingsKey(Keys.equivalentDomains);
  }

  async setEquivalentDomains(equivalentDomains: string[][]): Promise<void> {
    await this.setSettingsKey(Keys.equivalentDomains, equivalentDomains);
  }

  async clear(userId?: string): Promise<void> {
    this._settings.next([]);
    await this.stateService.setSettings(null, { userId: userId });
  }

  // Helpers

  private async getSettings(): Promise<any> {
    const settings = this._settings.getValue();
    if (settings == null) {
      // eslint-disable-next-line
      const userId = await this.stateService.getUserId();
    }
    return settings;
  }

  private async getSettingsKey(key: string): Promise<any> {
    const settings = await this.getSettings();
    if (settings != null && settings[key]) {
      return settings[key];
    }
    return null;
  }

  private async setSettingsKey(key: string, value: any): Promise<void> {
    let settings = await this.getSettings();
    if (!settings) {
      settings = {};
    }

    settings[key] = value;

    this._settings.next(settings);
    await this.stateService.setSettings(settings);
  }
}
