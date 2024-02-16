import { TokenService as AbstractTokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TokenService } from "@bitwarden/common/auth/services/token.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  StateProviderInitOptions,
  stateProviderFactory,
} from "../../../platform/background/service-factories/state-provider.factory";

type TokenServiceFactoryOptions = FactoryOptions;

export type TokenServiceInitOptions = TokenServiceFactoryOptions & StateProviderInitOptions;

export function tokenServiceFactory(
  cache: { tokenService?: AbstractTokenService } & CachedServices,
  opts: TokenServiceInitOptions,
): Promise<AbstractTokenService> {
  return factory(
    cache,
    "tokenService",
    opts,
    async () => new TokenService(await stateProviderFactory(cache, opts)),
  );
}
