import { LogoutReason } from "@bitwarden/auth/common";
import { ApiService as AbstractApiService } from "@bitwarden/common/abstractions/api.service";
import { ApiService } from "@bitwarden/common/services/api.service";
import { UserId } from "@bitwarden/common/types/guid";

import {
  tokenServiceFactory,
  TokenServiceInitOptions,
} from "../../../auth/background/service-factories/token-service.factory";
import {
  vaultTimeoutSettingsServiceFactory,
  VaultTimeoutSettingsServiceInitOptions,
} from "../../../background/service-factories/vault-timeout-settings-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../background/service-factories/factory-options";

import { AppIdServiceInitOptions, appIdServiceFactory } from "./app-id-service.factory";
import {
  environmentServiceFactory,
  EnvironmentServiceInitOptions,
} from "./environment-service.factory";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";

type ApiServiceFactoryOptions = FactoryOptions & {
  apiServiceOptions: {
    refreshAccessTokenErrorCallback?: () => Promise<void>;
    logoutCallback: (logoutReason: LogoutReason, userId?: UserId) => Promise<void>;
    customUserAgent?: string;
  };
};

export type ApiServiceInitOptions = ApiServiceFactoryOptions &
  TokenServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  EnvironmentServiceInitOptions &
  AppIdServiceInitOptions &
  LogServiceInitOptions &
  VaultTimeoutSettingsServiceInitOptions;

export function apiServiceFactory(
  cache: { apiService?: AbstractApiService } & CachedServices,
  opts: ApiServiceInitOptions,
): Promise<AbstractApiService> {
  return factory(
    cache,
    "apiService",
    opts,
    async () =>
      new ApiService(
        await tokenServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await environmentServiceFactory(cache, opts),
        await appIdServiceFactory(cache, opts),
        opts.apiServiceOptions.refreshAccessTokenErrorCallback ??
          (() => {
            return Promise.reject("No callback");
          }),
        await logServiceFactory(cache, opts),
        opts.apiServiceOptions.logoutCallback,
        await vaultTimeoutSettingsServiceFactory(cache, opts),
        opts.apiServiceOptions.customUserAgent,
      ),
  );
}
