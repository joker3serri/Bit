import { TokenService as AbstractTokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TokenService } from "@bitwarden/common/auth/services/token.service";

import {
  VaultTimeoutSettingsServiceInitOptions,
  vaultTimeoutSettingsServiceFactory,
} from "../../../background/service-factories/vault-timeout-settings-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  StateProviderInitOptions,
  stateProviderFactory,
} from "../../../platform/background/service-factories/state-provider.factory";
import {
  stateServiceFactory,
  StateServiceInitOptions,
} from "../../../platform/background/service-factories/state-service.factory";

type TokenServiceFactoryOptions = FactoryOptions;

// TODO: figure out circular dep.
export type TokenServiceInitOptions = TokenServiceFactoryOptions &
  StateServiceInitOptions &
  StateProviderInitOptions &
  VaultTimeoutSettingsServiceInitOptions;

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
        await stateServiceFactory(cache, opts),
        await stateProviderFactory(cache, opts),
        await vaultTimeoutSettingsServiceFactory(cache, opts),
      ),
  );
}
