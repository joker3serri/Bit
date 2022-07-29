import { StateService } from "@bitwarden/common/abstractions/state.service";
import { EnvironmentService } from "@bitwarden/common/services/environment.service";

type GroupPolicyEnvironment = {
  base?: string;
  webVault?: string;
  api?: string;
  identity?: string;
  icons?: string;
  notifications?: string;
  events?: string;
};

export class BrowserEnvironmentService extends EnvironmentService {
  constructor(stateService: StateService) {
    super(stateService);
  }

  async hasManagedEnvironment(): Promise<boolean> {
    return (await this.getManagedEnvironment()) != null;
  }

  async settingsHaveChanged() {
    const env = await this.getManagedEnvironment();

    return (
      env.base != this.baseUrl ||
      env.webVault != this.webVaultUrl ||
      env.api != this.webVaultUrl ||
      env.identity != this.identityUrl ||
      env.icons != this.iconsUrl ||
      env.notifications != this.notificationsUrl ||
      env.events != this.eventsUrl
    );
  }

  getManagedEnvironment(): Promise<GroupPolicyEnvironment> {
    return new Promise((resolve, reject) => {
      chrome.storage.managed.get("environment", (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        resolve(result.environment);
      });
    });
  }

  async setUrlsToManagedEnvironment() {
    const env = await this.getManagedEnvironment();
    await this.setUrls({
      base: env.base,
      webVault: env.webVault,
      api: env.api,
      identity: env.identity,
      icons: env.icons,
      notifications: env.notifications,
      events: env.events,
    });
  }
}
