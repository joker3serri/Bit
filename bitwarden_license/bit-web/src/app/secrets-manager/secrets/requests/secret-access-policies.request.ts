import { AccessPolicyRequest } from "../../shared/access-policies/models/requests/access-policy.request";

export class SecretAccessPoliciesRequest {
  userAccessPolicyRequests: AccessPolicyRequest[];
  groupAccessPolicyRequests: AccessPolicyRequest[];
  serviceAccountAccessPolicyRequests: AccessPolicyRequest[];
}
