import { Observable } from "rxjs";

import { UserId } from "../../types/guid";

export type Urls = {
  base?: string;
  webVault?: string;
  api?: string;
  identity?: string;
  icons?: string;
  notifications?: string;
  events?: string;
  keyConnector?: string;
  scim?: string;
};

/**
 * A subset of available regions, additional regions can be loaded through configuration.
 */
export enum Region {
  US = "US",
  EU = "EU",
  SelfHosted = "Self-hosted",
}

export type RegionConfig = {
  // Beware this isn't completely true, it's actually a string for custom environments,
  // which are currently only supported in web where it doesn't matter.
  key: Region;
  domain: string;
  urls: Urls;
};

/**
 * The Environment interface represents a server environment.
 *
 * It provides methods to retrieve the URLs of the different services.
 */
export interface Environment {
  /**
   * Retrieve the current region.
   */
  getRegion: () => Region;
  /**
   * Retrieve the urls, should only be used when configuring the environment.
   */
  getUrls: () => Urls;

  /**
   * Identify if the region is a cloud environment.
   *
   * @returns true if the environment is a cloud environment, false otherwise.
   */
  isCloud: () => boolean;

  getApiUrl: () => string;
  getEventsUrl: () => string;
  getIconsUrl: () => string;
  getIdentityUrl: () => string;
  getKeyConnectorUrl: () => string;
  getNotificationsUrl: () => string;
  getScimUrl: () => string;
  getSendUrl: () => string;
  getWebVaultUrl: () => string;

  /**
   * Get a friendly hostname for the environment.
   *
   * - For self-hosted this is the web vault url without protocol prefix.
   * - For cloud environments it's the domain key.
   */
  getHostname: () => string;

  // Not sure why we provide this, evaluate if we can remove it.
  hasBaseUrl: () => boolean;
}

/**
 * The environment service. Provides access to set the current environment urls and region.
 */
export abstract class EnvironmentService {
  environment$: Observable<Environment>;

  /**
   * Retrieve all the available regions for environment selectors.
   *
   * This currently relies on compile time provided constants, and will not change at runtime.
   * Expect all builds to include production environments, QA builds to also include QA
   * environments and dev builds to include localhost.
   */
  availableRegions: () => RegionConfig[];

  /**
   * Set the global environment.
   */
  setEnvironment: (region: Region, urls?: Urls) => Promise<Urls>;

  /**
   * Load state from disk
   */
  setUrlsFromStorage: () => Promise<void>;

  /**
   * Seed the environment for a given user based on the globally set defaults.
   */
  seedUserEnvironment: (userId: UserId) => Promise<void>;

  // ----
  // The remaining functions should be removed
  // ----

  /** @deprecated External services shouldn't need to be aware of if base url is set */
  hasBaseUrl: () => boolean;

  /**
   * Retrieves the URL of the cloud web vault app.
   *
   * @returns The URL of the cloud web vault app.
   * @remarks Use this method only in views exclusive to self-host instances.
   */
  getCloudWebVaultUrl: () => string;
  /**
   * Sets the URL of the cloud web vault app based on the region parameter.
   *
   * @param region - The region of the cloud web vault app.
   */
  setCloudWebVaultUrl: (region: Region) => void;

  /**
   * Get the environment from state. Useful if you need to get the environment for another user.
   */
  getEnvironment: (userId?: string) => Promise<Environment | undefined>;
}
