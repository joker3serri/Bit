import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/login.service";
import { LoginService } from "@bitwarden/common/auth/services/login.service";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  stateProviderFactory,
  StateProviderInitOptions,
} from "../../../platform/background/service-factories/state-provider.factory";

type LoginServiceFactoryOptions = FactoryOptions;

export type LoginServiceInitOptions = LoginServiceFactoryOptions & StateProviderInitOptions;

export function loginServiceFactory(
  cache: { loginService?: LoginServiceAbstraction } & CachedServices,
  opts: LoginServiceInitOptions,
): Promise<LoginServiceAbstraction> {
  return factory(
    cache,
    "loginService",
    opts,
    async () => new LoginService(await stateProviderFactory(cache, opts)),
  );
}
