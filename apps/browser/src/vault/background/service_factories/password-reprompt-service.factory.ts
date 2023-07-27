import { PasswordRepromptService } from "@bitwarden/angular/vault/services/password-reprompt.service";
import { PasswordRepromptService as AbstractPasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";

type PasswordRepromptServiceFactoryOptions = FactoryOptions;

export type PasswordRepromptServiceInitOptions = PasswordRepromptServiceFactoryOptions;

export function syncNotifierServiceFactory(
  cache: { syncNotifierService?: AbstractPasswordRepromptService } & CachedServices,
  opts: PasswordRepromptServiceInitOptions
): Promise<AbstractPasswordRepromptService> {
  return factory(cache, "passwordRepromptService", opts, () =>
    Promise.resolve(new PasswordRepromptService())
  );
}
