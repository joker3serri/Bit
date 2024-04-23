import { AccountActivityService } from "@bitwarden/common/auth/abstractions/account-activity.service";
import { DefaultAccountActivityService } from "@bitwarden/common/auth/services/account-activity.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  GlobalStateProviderInitOptions,
  globalStateProviderFactory,
} from "../../../platform/background/service-factories/global-state-provider.factory";

type AccountActivityServiceFactoryOptions = FactoryOptions;

export type AccountActivityServiceInitOptions = AccountActivityServiceFactoryOptions &
  GlobalStateProviderInitOptions;

export function accountActivityServiceFactory(
  cache: { accountActivityService?: AccountActivityService } & CachedServices,
  opts: AccountActivityServiceInitOptions,
): Promise<AccountActivityService> {
  return factory(
    cache,
    "accountActivityService",
    opts,
    async () => new DefaultAccountActivityService(await globalStateProviderFactory(cache, opts)),
  );
}
