import { LoginEmailService as LoginEmailServiceAbstraction } from "@bitwarden/common/auth/abstractions/login-email.service";
import { LoginEmailService } from "@bitwarden/common/auth/services/login-email.service";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../../platform/background/service-factories/factory-options";
import {
  stateProviderFactory,
  StateProviderInitOptions,
} from "../../../platform/background/service-factories/state-provider.factory";

type EmailServiceFactoryOptions = FactoryOptions;

export type EmailServiceInitOptions = EmailServiceFactoryOptions & StateProviderInitOptions;

export function emailServiceFactory(
  cache: { emailService?: LoginEmailServiceAbstraction } & CachedServices,
  opts: EmailServiceInitOptions,
): Promise<LoginEmailServiceAbstraction> {
  return factory(
    cache,
    "emailService",
    opts,
    async () => new LoginEmailService(await stateProviderFactory(cache, opts)),
  );
}
