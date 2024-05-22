import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import {
  GroupSecretAccessPolicyResponse,
  UserSecretAccessPolicyResponse,
  ServiceAccountSecretAccessPolicyResponse,
} from "./access-policy.response";

export class SecretAccessPoliciesResponse extends BaseResponse {
  userAccessPolicies: UserSecretAccessPolicyResponse[];
  groupAccessPolicies: GroupSecretAccessPolicyResponse[];
  serviceAccountAccessPolicies: ServiceAccountSecretAccessPolicyResponse[];

  constructor(response: any) {
    super(response);
    const userAccessPolicies = this.getResponseProperty("UserAccessPolicies");
    this.userAccessPolicies = userAccessPolicies.map(
      (k: any) => new UserSecretAccessPolicyResponse(k),
    );
    const groupAccessPolicies = this.getResponseProperty("GroupAccessPolicies");
    this.groupAccessPolicies = groupAccessPolicies.map(
      (k: any) => new GroupSecretAccessPolicyResponse(k),
    );
    const serviceAccountAccessPolicies = this.getResponseProperty("ServiceAccountAccessPolicies");
    this.serviceAccountAccessPolicies = serviceAccountAccessPolicies.map(
      (k: any) => new ServiceAccountSecretAccessPolicyResponse(k),
    );
  }
}
