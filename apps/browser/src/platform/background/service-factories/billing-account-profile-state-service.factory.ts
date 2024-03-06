import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/services/account/billing-account-profile-state.service";

import { activeUserStateProviderFactory } from "./active-user-state-provider.factory";
import { FactoryOptions, CachedServices, factory } from "./factory-options";
import { StateProviderInitOptions } from "./state-provider.factory";

type BillingAccountProfileStateServiceFactoryOptions = FactoryOptions;

export type BillingAccountProfileStateServiceInitOptions =
  BillingAccountProfileStateServiceFactoryOptions & StateProviderInitOptions;

export function billingAccountProfileStateServiceFactory(
  cache: {
    billingAccountProfileStateService?: BillingAccountProfileStateServiceAbstraction;
  } & CachedServices,
  opts: BillingAccountProfileStateServiceInitOptions,
): Promise<BillingAccountProfileStateServiceAbstraction> {
  return factory(
    cache,
    "billingAccountProfileStateService",
    opts,
    async () =>
      new BillingAccountProfileStateService(await activeUserStateProviderFactory(cache, opts)),
  );
}
