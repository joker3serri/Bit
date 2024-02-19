import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/login.service";
import { LoginService } from "@bitwarden/common/auth/services/login.service";

import {
  CachedServices,
  FactoryOptions,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  StateServiceInitOptions,
  stateServiceFactory,
} from "../../../platform/background/service-factories/state-service.factory";

type LoginServiceFactoryOptions = FactoryOptions;

export type LoginServiceInitOptions = LoginServiceFactoryOptions & StateServiceInitOptions;

export function loginServiceFactory(
  cache: { loginService?: LoginServiceAbstraction } & CachedServices,
  opts: LoginServiceInitOptions,
): Promise<LoginServiceAbstraction> {
  return factory(
    cache,
    "loginService",
    opts,
    async () => new LoginService(await stateServiceFactory(cache, opts)),
  );
}
