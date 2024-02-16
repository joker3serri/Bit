import { Observable } from "rxjs";

import { ListResponse } from "../../../models/response/list.response";
import { UserId } from "../../../types/guid";
import { PolicyType } from "../../enums";
import { PolicyData } from "../../models/data/policy.data";
import { MasterPasswordPolicyOptions } from "../../models/domain/master-password-policy-options";
import { Policy } from "../../models/domain/policy";
import { ResetPasswordPolicyOptions } from "../../models/domain/reset-password-policy-options";
import { PolicyResponse } from "../../models/response/policy.response";

export abstract class PolicyService {
  /**
   * @deprecated Use activeUserPolicies$ instead
   */

  policies$: Observable<Policy[]>;
  activeUserPolicies$: Observable<Policy[]>;
  get$: (policyType: PolicyType) => Observable<Policy>;
  getAll$: (policyType: PolicyType, userId?: UserId) => Observable<Policy[]>;
  policyAppliesToActiveUser$: (policyType: PolicyType) => Observable<boolean>;

  // Policy specific interfaces

  /**
   * Combines all Master Password policies that apply to the user.
   * @returns a set of options which represent the minimum Master Password settings that the user must
   * comply with in order to comply with **all** Master Password policies.
   */
  masterPasswordPolicyOptions$: (policies?: Policy[]) => Observable<MasterPasswordPolicyOptions>;

  /**
   * Evaluates whether a proposed Master Password complies with all Master Password policies that apply to the user.
   */
  evaluateMasterPassword: (
    passwordStrength: number,
    newPassword: string,
    enforcedPolicyOptions?: MasterPasswordPolicyOptions,
  ) => boolean;

  /**
   * @returns Reset Password policy options for the specified organization and a boolean indicating whether the policy
   * is enabled
   */
  getResetPasswordPolicyOptions: (
    policies: Policy[],
    orgId: string,
  ) => [ResetPasswordPolicyOptions, boolean];

  // Helpers

  /**
   * Instantiates {@link Policy} objects from {@link PolicyResponse} objects.
   */
  mapPolicyFromResponse: (policyResponse: PolicyResponse) => Policy;

  /**
   * Instantiates {@link Policy} objects from {@link ListResponse<PolicyResponse>} objects.
   */
  mapPoliciesFromToken: (policiesResponse: ListResponse<PolicyResponse>) => Policy[];
}

export abstract class InternalPolicyService extends PolicyService {
  upsert: (policy: PolicyData) => Promise<void>;
  replace: (policies: { [id: string]: PolicyData }) => Promise<void>;
  clear: (userId?: string) => Promise<any>;
}
