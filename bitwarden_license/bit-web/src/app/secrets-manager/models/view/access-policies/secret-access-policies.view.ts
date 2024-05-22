import {
  GroupSecretAccessPolicyView,
  UserSecretAccessPolicyView,
  ServiceAccountSecretAccessPolicyView,
} from "./access-policy.view";

export class SecretAccessPoliciesView {
  userAccessPolicies: UserSecretAccessPolicyView[];
  groupAccessPolicies: GroupSecretAccessPolicyView[];
  serviceAccountAccessPolicies: ServiceAccountSecretAccessPolicyView[];
}
