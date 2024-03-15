import { EmailService as EmailServiceAbstraction } from "@bitwarden/common/auth/abstractions/email.service";
import { EmailService } from "@bitwarden/common/auth/services/email.service";

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
  cache: { emailService?: EmailServiceAbstraction } & CachedServices,
  opts: EmailServiceInitOptions,
): Promise<EmailServiceAbstraction> {
  return factory(
    cache,
    "emailService",
    opts,
    async () => new EmailService(await stateProviderFactory(cache, opts)),
  );
}
