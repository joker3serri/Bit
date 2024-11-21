import { Injectable } from "@angular/core";
import { map } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";

@Injectable({ providedIn: "root" })
export class FreeFamiliesPolicyService {
  constructor(private policyService: PolicyService) {}

  getPolicyStatus$(orgId: string, policyType: PolicyType) {
    return this.policyService.policies$.pipe(
      map((policies: Policy[]) =>
        policies.some(
          (policy) =>
            policy.organizationId === orgId && policy.type === policyType && policy.enabled,
        ),
      ),
    );
  }
}
