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
  Environment,
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
  private readonly environmentSubject = new ReplaySubject<Environment>(1);
  environment$ = this.environmentSubject.asObservable();
  initialized = false;

  private cloudWebVaultUrl: string;

  private globalState: GlobalState<EnvironmentState | null>;

  protected environment: UrlEnvironment = new UrlEnvironment(
    DEFAULT_REGION,
    DEFAULT_REGION_CONFIG.urls,
  );

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

  get selectedRegion() {
    return this.environment.getRegion();
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

    if (region != Region.SelfHosted) {
      await this.globalState.update(() => ({
        region: region,
        urls: null,
      }));

      const regionConfig = this.getRegionConfig(region);
      this.createAndSetEnvironment(region, regionConfig.urls);

      return null;
    } else {
      // Clean the urls
      urls.base = formatUrl(urls.base);
      urls.webVault = formatUrl(urls.webVault);
      urls.api = formatUrl(urls.api);
      urls.identity = formatUrl(urls.identity);
      urls.icons = formatUrl(urls.icons);
      urls.notifications = formatUrl(urls.notifications);
      urls.events = formatUrl(urls.events);
      urls.keyConnector = formatUrl(urls.keyConnector);
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

      this.createAndSetEnvironment(region, urls);

      return urls;
    }
  }

  /**
   * Helper for creating and setting the environment.
   *
   * @param region
   * @param urls
   */
  protected createAndSetEnvironment(region: Region, urls: Urls) {
    this.environment = new UrlEnvironment(region, urls);
    this.environmentSubject.next(this.environment);
  }

  hasBaseUrl() {
    return this.environment.hasBaseUrl();
  }

  getNotificationsUrl() {
    return this.environment.getNotificationsUrl();
  }

  getWebVaultUrl() {
    return this.environment.getWebVaultUrl();
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
    return this.environment.getSendUrl();
  }

  getIconsUrl() {
    return this.environment.getIconsUrl();
  }

  getApiUrl() {
    return this.environment.getApiUrl();
  }

  getIdentityUrl() {
    return this.environment.getIdentityUrl();
  }

  getEventsUrl() {
    return this.environment.getEventsUrl();
  }

  getKeyConnectorUrl() {
    return this.environment.getKeyConnectorUrl();
  }

  getScimUrl() {
    return this.environment.getScimUrl();
  }

  async setUrlsFromStorage(): Promise<void> {
    const activeUserId = await firstValueFrom(this.activeAccountId$);
    const state = await this.getEnvironmentState(activeUserId);

    await this.setEnvironment(state?.region ?? DEFAULT_REGION, state?.urls);
  }

  getUrls() {
    const urls = this.environment.getUrls();
    return { ...urls, cloudWebVault: this.cloudWebVaultUrl };
  }

  isEmpty(): boolean {
    return isEmpty(this.environment.getUrls());
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

  isCloud(): boolean {
    return this.environment.isCloud();
  }
}

function formatUrl(url: string): string {
  if (url == null || url === "") {
    return null;
  }

  url = url.replace(/\/+$/g, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  return url.trim();
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
class UrlEnvironment implements Environment {
  constructor(
    private region: Region,
    private urls: Urls,
  ) {
    // Scim is always null for self-hosted
    if (region == Region.SelfHosted) {
      this.urls.scim = null;
    }
  }

  getRegion() {
    return this.region;
  }

  getUrls() {
    return {
      base: this.urls.base,
      webVault: this.urls.webVault,
      api: this.urls.api,
      identity: this.urls.identity,
      icons: this.urls.icons,
      notifications: this.urls.notifications,
      events: this.urls.events,
      keyConnector: this.urls.keyConnector,
      scim: this.urls.scim,
    };
  }

  hasBaseUrl() {
    return this.urls.base != null;
  }

  getWebVaultUrl() {
    return this.getUrl("webVault", "");
  }

  getApiUrl() {
    return this.getUrl("api", "/api");
  }

  getEventsUrl() {
    return this.getUrl("events", "/events");
  }

  getIconsUrl() {
    return this.getUrl("icons", "/icons");
  }

  getIdentityUrl() {
    return this.getUrl("identity", "/identity");
  }

  getKeyConnectorUrl() {
    return this.urls.keyConnector;
  }

  getNotificationsUrl() {
    return this.getUrl("notifications", "/notifications");
  }

  getScimUrl() {
    if (this.urls.scim != null) {
      return this.urls.scim + "/v2";
    }

    return this.getWebVaultUrl() === "https://vault.bitwarden.com"
      ? "https://scim.bitwarden.com/v2"
      : this.getWebVaultUrl() + "/scim/v2";
  }

  getSendUrl() {
    return this.getWebVaultUrl() === "https://vault.bitwarden.com"
      ? "https://send.bitwarden.com/#"
      : this.getWebVaultUrl() + "/#/send/";
  }

  isCloud(): boolean {
    return [
      "https://api.bitwarden.com",
      "https://vault.bitwarden.com/api",
      "https://api.bitwarden.eu",
      "https://vault.bitwarden.eu/api",
    ].includes(this.getApiUrl());
  }

  /**
   * Helper for getting an URL.
   *
   * @param key Key of the URL to get from URLs
   * @param baseSuffix Suffix to append to the base URL if the url is not set
   * @returns
   */
  private getUrl(key: keyof Urls, baseSuffix: string) {
    if (this.urls[key] != null) {
      return this.urls[key];
    }

    if (this.urls.base) {
      return this.urls.base + baseSuffix;
    }

    return DEFAULT_REGION_CONFIG.urls[key];
  }
}
