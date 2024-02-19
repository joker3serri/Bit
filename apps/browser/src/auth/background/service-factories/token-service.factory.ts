import { TokenService as AbstractTokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TokenService } from "@bitwarden/common/auth/services/token.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "../../../platform/background/service-factories/platform-utils-service.factory";
import {
  StateProviderInitOptions,
  stateProviderFactory,
} from "../../../platform/background/service-factories/state-provider.factory";
import {
  SecureStorageServiceInitOptions,
  secureStorageServiceFactory,
} from "../../../platform/background/service-factories/storage-service.factory";

type TokenServiceFactoryOptions = FactoryOptions;

export type TokenServiceInitOptions = TokenServiceFactoryOptions &
  StateProviderInitOptions &
  PlatformUtilsServiceInitOptions &
  SecureStorageServiceInitOptions;

export function tokenServiceFactory(
  cache: { tokenService?: AbstractTokenService } & CachedServices,
  opts: TokenServiceInitOptions,
): Promise<AbstractTokenService> {
  return factory(
    cache,
    "tokenService",
    opts,
    async () =>
      new TokenService(
        await stateProviderFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await secureStorageServiceFactory(cache, opts),
      ),
  );
}
