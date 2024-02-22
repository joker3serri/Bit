import {
  concatMap,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  ReplaySubject,
} from "rxjs";
import { Jsonify } from "type-fest";

import { AccountService } from "../../auth/abstractions/account.service";
import { UserId } from "../../types/guid";
import {
  EnvironmentService as EnvironmentServiceAbstraction,
  Region,
  RegionConfig,
  Urls,
} from "../abstractions/environment.service";
import { Utils } from "../misc/utils";
import { ENVIRONMENT_DISK, GlobalState, KeyDefinition, StateProvider } from "../state";

export class EnvironmentUrls {
  base: string = null;
  api: string = null;
  identity: string = null;
  icons: string = null;
  notifications: string = null;
  events: string = null;
  webVault: string = null;
  keyConnector: string = null;

  static fromJSON(obj: Jsonify<EnvironmentUrls>): EnvironmentUrls {
    return Object.assign(new EnvironmentUrls(), obj);
  }
}

class EnvironmentState {
  region: Region;
  urls: EnvironmentUrls;

  static fromJSON(obj: Jsonify<EnvironmentState>): EnvironmentState {
    return Object.assign(new EnvironmentState(), obj);
  }
}

const ENVIRONMENT_KEY = new KeyDefinition<EnvironmentState>(ENVIRONMENT_DISK, "environment", {
  deserializer: EnvironmentState.fromJSON,
});

/**
 * The production regions available for selection.
 *
 * In the future we desire to load these urls from the config endpoint.
 */
export const PRODUCTION_REGIONS: RegionConfig[] = [
  {
    key: Region.US,
    domain: "bitwarden.com",
    urls: {
      base: null,
      api: "https://api.bitwarden.com",
      identity: "https://identity.bitwarden.com",
      icons: "https://icons.bitwarden.net",
      webVault: "https://vault.bitwarden.com",
      notifications: "https://notifications.bitwarden.com",
      events: "https://events.bitwarden.com",
      scim: "https://scim.bitwarden.com",
    },
  },
  {
    key: Region.EU,
    domain: "bitwarden.eu",
    urls: {
      base: null,
      api: "https://api.bitwarden.eu",
      identity: "https://identity.bitwarden.eu",
      icons: "https://icons.bitwarden.eu",
      webVault: "https://vault.bitwarden.eu",
      notifications: "https://notifications.bitwarden.eu",
      events: "https://events.bitwarden.eu",
      scim: "https://scim.bitwarden.eu",
    },
  },
];

/**
 * The default region when starting the app.
 */
const DEFAULT_REGION = Region.US;

/**
 * The default region configuration.
 */
const DEFAULT_REGION_CONFIG = PRODUCTION_REGIONS.find((r) => r.key === DEFAULT_REGION);

export class EnvironmentService implements EnvironmentServiceAbstraction {
  private readonly urlsSubject = new ReplaySubject<void>(1);
  urls: Observable<void> = this.urlsSubject.asObservable();
  selectedRegion?: Region;
  initialized = false;

  protected baseUrl: string;
  protected webVaultUrl: string;
  protected apiUrl: string;
  protected identityUrl: string;
  protected iconsUrl: string;
  protected notificationsUrl: string;
  protected eventsUrl: string;
  private keyConnectorUrl: string;
  private scimUrl: string = null;
  private cloudWebVaultUrl: string;

  private globalState: GlobalState<EnvironmentState | null>;

  private activeAccountId$: Observable<UserId | null>;

  constructor(
    private stateProvider: StateProvider,
    private accountService: AccountService,
  ) {
    // We intentionally don't want the helper on account service, we want the null back if there is no active user
    this.activeAccountId$ = this.accountService.activeAccount$.pipe(map((a) => a?.id));

    // TODO: Get rid of early subscription during EnvironmentService refactor
    this.activeAccountId$
      .pipe(
        // Use == here to not trigger on undefined -> null transition
        distinctUntilChanged((oldUserId: string, newUserId: string) => oldUserId == newUserId),
        concatMap(async () => {
          if (!this.initialized) {
            return;
          }
          await this.setUrlsFromStorage();
        }),
      )
      .subscribe();

    this.globalState = this.stateProvider.getGlobal(ENVIRONMENT_KEY);
  }

  availableRegions(): RegionConfig[] {
    const additionalRegions = (process.env.ADDITIONAL_REGIONS as unknown as RegionConfig[]) ?? [];
    return PRODUCTION_REGIONS.concat(additionalRegions);
  }

  /**
   * Get the region configuration for the given region.
   */
  private getRegionConfig(region: Region): RegionConfig | undefined {
    return this.availableRegions().find((r) => r.key === region);
  }

  async setEnvironment(region: Region, urls?: Urls): Promise<Urls> {
    // Unknown regions are treated as self-hosted
    if (this.getRegionConfig(region) == null) {
      region = Region.SelfHosted;
    }

    // If self-hosted ensure urls are valid else fallback to default region
    if (region == Region.SelfHosted && isEmpty(urls)) {
      region = DEFAULT_REGION;
    }

    this.selectedRegion = region;

    if (region != Region.SelfHosted) {
      await this.globalState.update(() => ({
        region: region,
        urls: null,
      }));

      const regionConfig = this.getRegionConfig(region);
      await this.setUrlsInternal(regionConfig.urls);

      return null;
    } else {
      // Clean the urls
      urls.base = this.formatUrl(urls.base);
      urls.webVault = this.formatUrl(urls.webVault);
      urls.api = this.formatUrl(urls.api);
      urls.identity = this.formatUrl(urls.identity);
      urls.icons = this.formatUrl(urls.icons);
      urls.notifications = this.formatUrl(urls.notifications);
      urls.events = this.formatUrl(urls.events);
      urls.keyConnector = this.formatUrl(urls.keyConnector);
      urls.scim = null;

      await this.globalState.update(() => ({
        region: region,
        urls: {
          base: urls.base,
          api: urls.api,
          identity: urls.identity,
          webVault: urls.webVault,
          icons: urls.icons,
          notifications: urls.notifications,
          events: urls.events,
          keyConnector: urls.keyConnector,
        },
      }));

      await this.setUrlsInternal(urls);

      return urls;
    }
  }

  hasBaseUrl() {
    return this.baseUrl != null;
  }

  getNotificationsUrl() {
    if (this.notificationsUrl != null) {
      return this.notificationsUrl;
    }

    if (this.baseUrl != null) {
      return this.baseUrl + "/notifications";
    }

    return "https://notifications.bitwarden.com";
  }

  getWebVaultUrl() {
    if (this.webVaultUrl != null) {
      return this.webVaultUrl;
    }

    if (this.baseUrl) {
      return this.baseUrl;
    }
    return "https://vault.bitwarden.com";
  }

  getCloudWebVaultUrl() {
    if (this.cloudWebVaultUrl != null) {
      return this.cloudWebVaultUrl;
    }

    return DEFAULT_REGION_CONFIG.urls.webVault;
  }

  setCloudWebVaultUrl(region: Region) {
    const r = this.getRegionConfig(region);

    if (r != null) {
      this.cloudWebVaultUrl = r.urls.webVault;
    }
  }

  getSendUrl() {
    return this.getWebVaultUrl() === "https://vault.bitwarden.com"
      ? "https://send.bitwarden.com/#"
      : this.getWebVaultUrl() + "/#/send/";
  }

  getIconsUrl() {
    if (this.iconsUrl != null) {
      return this.iconsUrl;
    }

    if (this.baseUrl) {
      return this.baseUrl + "/icons";
    }

    return "https://icons.bitwarden.net";
  }

  getApiUrl() {
    if (this.apiUrl != null) {
      return this.apiUrl;
    }

    if (this.baseUrl) {
      return this.baseUrl + "/api";
    }

    return "https://api.bitwarden.com";
  }

  getIdentityUrl() {
    if (this.identityUrl != null) {
      return this.identityUrl;
    }

    if (this.baseUrl) {
      return this.baseUrl + "/identity";
    }

    return "https://identity.bitwarden.com";
  }

  getEventsUrl() {
    if (this.eventsUrl != null) {
      return this.eventsUrl;
    }

    if (this.baseUrl) {
      return this.baseUrl + "/events";
    }

    return "https://events.bitwarden.com";
  }

  getKeyConnectorUrl() {
    return this.keyConnectorUrl;
  }

  getScimUrl() {
    if (this.scimUrl != null) {
      return this.scimUrl + "/v2";
    }

    return this.getWebVaultUrl() === "https://vault.bitwarden.com"
      ? "https://scim.bitwarden.com/v2"
      : this.getWebVaultUrl() + "/scim/v2";
  }

  async setUrlsFromStorage(): Promise<void> {
    const activeUserId = await firstValueFrom(this.activeAccountId$);
    const state = await this.getEnvironmentState(activeUserId);

    await this.setEnvironment(state?.region ?? DEFAULT_REGION, state?.urls);
  }

  getUrls() {
    return {
      base: this.baseUrl,
      webVault: this.webVaultUrl,
      cloudWebVault: this.cloudWebVaultUrl,
      api: this.apiUrl,
      identity: this.identityUrl,
      icons: this.iconsUrl,
      notifications: this.notificationsUrl,
      events: this.eventsUrl,
      keyConnector: this.keyConnectorUrl,
      scim: this.scimUrl,
    };
  }

  isEmpty(): boolean {
    return (
      this.baseUrl == null &&
      this.webVaultUrl == null &&
      this.apiUrl == null &&
      this.identityUrl == null &&
      this.iconsUrl == null &&
      this.notificationsUrl == null &&
      this.eventsUrl == null
    );
  }

  async getHost(userId?: UserId) {
    const state = await this.getEnvironmentState(userId);
    const regionConfig = this.getRegionConfig(state.region);

    if (regionConfig != null) {
      return regionConfig.domain;
    }

    // No environment found, assume self-hosted
    return Utils.getHost(state.urls.webVault || state.urls.base);
  }

  private async getEnvironmentState(userId: UserId | null) {
    // Previous rules dictated that we only get from user scoped state if there is an active user.
    const activeUserId = await firstValueFrom(this.activeAccountId$);
    return activeUserId == null
      ? await firstValueFrom(this.globalState.state$)
      : await firstValueFrom(
          this.stateProvider.getUser(userId ?? activeUserId, ENVIRONMENT_KEY).state$,
        );
  }

  async seedUserEnvironment(userId: UserId) {
    const global = await firstValueFrom(this.globalState.state$);
    await this.stateProvider.getUser(userId, ENVIRONMENT_KEY).update(() => global);
  }

  protected setUrlsInternal(urls: Urls) {
    this.baseUrl = this.formatUrl(urls.base);
    this.webVaultUrl = this.formatUrl(urls.webVault);
    this.apiUrl = this.formatUrl(urls.api);
    this.identityUrl = this.formatUrl(urls.identity);
    this.iconsUrl = this.formatUrl(urls.icons);
    this.notificationsUrl = this.formatUrl(urls.notifications);
    this.eventsUrl = this.formatUrl(urls.events);
    this.keyConnectorUrl = this.formatUrl(urls.keyConnector);
    this.scimUrl = this.formatUrl(urls.scim);

    this.urlsSubject.next();
  }

  private formatUrl(url: string): string {
    if (url == null || url === "") {
      return null;
    }

    url = url.replace(/\/+$/g, "");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    return url.trim();
  }

  isCloud(): boolean {
    return [
      "https://api.bitwarden.com",
      "https://vault.bitwarden.com/api",
      "https://api.bitwarden.eu",
      "https://vault.bitwarden.eu/api",
    ].includes(this.getApiUrl());
  }
}

function isEmpty(u?: Urls): boolean {
  if (u == null) {
    return true;
  }

  return (
    u.base == null &&
    u.webVault == null &&
    u.api == null &&
    u.identity == null &&
    u.icons == null &&
    u.notifications == null &&
    u.events == null
  );
}
