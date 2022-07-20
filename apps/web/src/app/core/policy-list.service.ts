import { BasePolicy } from "../organizations/policies/components/base-policy.component";

export class PolicyListService {
  private policies: BasePolicy[] = [];

  addPolicies(policies: BasePolicy[]) {
    this.policies.push(...policies);
  }

  getPolicies(): BasePolicy[] {
    return this.policies;
  }
}
