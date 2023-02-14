import { PolicyService as AbstractPolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";

import {
  organizationServiceFactory,
  OrganizationServiceInitOptions,
} from "../../admin-console/background/service-factories/organization-service.factory";
import { BrowserPolicyService } from "../../services/browser-policy.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";

type PolicyServiceFactoryOptions = FactoryOptions;

export type PolicyServiceInitOptions = PolicyServiceFactoryOptions &
  StateServiceInitOptions &
  OrganizationServiceInitOptions;

export function policyServiceFactory(
  cache: { policyService?: AbstractPolicyService } & CachedServices,
  opts: PolicyServiceInitOptions
): Promise<AbstractPolicyService> {
  return factory(
    cache,
    "policyService",
    opts,
    async () =>
      new BrowserPolicyService(
        await stateServiceFactory(cache, opts),
        await organizationServiceFactory(cache, opts)
      )
  );
}
