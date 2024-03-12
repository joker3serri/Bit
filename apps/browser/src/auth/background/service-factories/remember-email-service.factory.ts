import { RememberEmailService as RememberEmailServiceAbstraction } from "@bitwarden/common/auth/abstractions/remember-email.service";
import { RememberEmailService } from "@bitwarden/common/auth/services/remember-email.service";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  stateProviderFactory,
  StateProviderInitOptions,
} from "../../../platform/background/service-factories/state-provider.factory";

type RememberEmailServiceFactoryOptions = FactoryOptions;

export type RememberEmailServiceInitOptions = RememberEmailServiceFactoryOptions &
  StateProviderInitOptions;

export function rememberEmailServiceFactory(
  cache: { rememberEmailService?: RememberEmailServiceAbstraction } & CachedServices,
  opts: RememberEmailServiceInitOptions,
): Promise<RememberEmailServiceAbstraction> {
  return factory(
    cache,
    "rememberEmailService",
    opts,
    async () => new RememberEmailService(await stateProviderFactory(cache, opts)),
  );
}
