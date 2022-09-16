import { of, concatMap, BehaviorSubject, Observable, map } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

import { OrganizationService } from "../../abstractions/organization.service";
import { InternalPolicyService as InternalPolicyServiceAbstraction } from "../../abstractions/policy/policy.service.abstraction";
import { StateService } from "../../abstractions/state.service";
import { VaultTimeoutSettingsService } from "../../abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { OrganizationUserStatusType } from "../../enums/organizationUserStatusType";
import { OrganizationUserType } from "../../enums/organizationUserType";
import { PolicyType } from "../../enums/policyType";
import { PolicyData } from "../../models/data/policyData";
import { MasterPasswordPolicyOptions } from "../../models/domain/masterPasswordPolicyOptions";
import { Organization } from "../../models/domain/organization";
import { Policy } from "../../models/domain/policy";
import { ResetPasswordPolicyOptions } from "../../models/domain/resetPasswordPolicyOptions";
import { ListResponse } from "../../models/response/listResponse";
import { PolicyResponse } from "../../models/response/policyResponse";

export class PolicyService implements InternalPolicyServiceAbstraction {
  private _policies: BehaviorSubject<Policy[]> = new BehaviorSubject([]);

  policies$ = this._policies.asObservable();

  constructor(
    private stateService: StateService,
    private organizationService: OrganizationService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService
  ) {
    this.stateService.activeAccountUnlocked$
      .pipe(
        concatMap(async (unlocked) => {
          if (Utils.global.bitwardenContainerService == null) {
            return;
          }

          if (!unlocked) {
            this._policies.next([]);
            return;
          }

          const data = await this.stateService.getEncryptedPolicies();

          await this.updateObservables(data);

          await this.updateVaultTimeoutValue();
        })
      )
      .subscribe();
  }

  masterPasswordPolicyOptions$(policies?: Policy[]): Observable<MasterPasswordPolicyOptions> {
    const observable = policies ? of(policies) : this.policies$;
    return observable.pipe(
      map((obsPolicies) => {
        let enforcedOptions: MasterPasswordPolicyOptions = null;
        const filteredPolicies = obsPolicies.filter((p) => p.type === PolicyType.MasterPassword);

        if (filteredPolicies == null || filteredPolicies.length === 0) {
          return enforcedOptions;
        }

        filteredPolicies.forEach((currentPolicy) => {
          if (!currentPolicy.enabled || currentPolicy.data == null) {
            return;
          }

          if (enforcedOptions == null) {
            enforcedOptions = new MasterPasswordPolicyOptions();
          }

          if (
            currentPolicy.data.minComplexity != null &&
            currentPolicy.data.minComplexity > enforcedOptions.minComplexity
          ) {
            enforcedOptions.minComplexity = currentPolicy.data.minComplexity;
          }

          if (
            currentPolicy.data.minLength != null &&
            currentPolicy.data.minLength > enforcedOptions.minLength
          ) {
            enforcedOptions.minLength = currentPolicy.data.minLength;
          }

          if (currentPolicy.data.requireUpper) {
            enforcedOptions.requireUpper = true;
          }

          if (currentPolicy.data.requireLower) {
            enforcedOptions.requireLower = true;
          }

          if (currentPolicy.data.requireNumbers) {
            enforcedOptions.requireNumbers = true;
          }

          if (currentPolicy.data.requireSpecial) {
            enforcedOptions.requireSpecial = true;
          }
        });

        return enforcedOptions;
      })
    );
  }

  evaluateMasterPassword(
    passwordStrength: number,
    newPassword: string,
    enforcedPolicyOptions: MasterPasswordPolicyOptions
  ): boolean {
    if (enforcedPolicyOptions == null) {
      return true;
    }

    if (
      enforcedPolicyOptions.minComplexity > 0 &&
      enforcedPolicyOptions.minComplexity > passwordStrength
    ) {
      return false;
    }

    if (
      enforcedPolicyOptions.minLength > 0 &&
      enforcedPolicyOptions.minLength > newPassword.length
    ) {
      return false;
    }

    if (enforcedPolicyOptions.requireUpper && newPassword.toLocaleLowerCase() === newPassword) {
      return false;
    }

    if (enforcedPolicyOptions.requireLower && newPassword.toLocaleUpperCase() === newPassword) {
      return false;
    }

    if (enforcedPolicyOptions.requireNumbers && !/[0-9]/.test(newPassword)) {
      return false;
    }

    // eslint-disable-next-line
    if (enforcedPolicyOptions.requireSpecial && !/[!@#$%\^&*]/g.test(newPassword)) {
      return false;
    }

    return true;
  }

  getResetPasswordPolicyOptions(
    policies: Policy[],
    orgId: string
  ): [ResetPasswordPolicyOptions, boolean] {
    const resetPasswordPolicyOptions = new ResetPasswordPolicyOptions();

    if (policies == null || orgId == null) {
      return [resetPasswordPolicyOptions, false];
    }

    const policy = policies.find(
      (p) => p.organizationId === orgId && p.type === PolicyType.ResetPassword && p.enabled
    );
    resetPasswordPolicyOptions.autoEnrollEnabled = policy?.data?.autoEnrollEnabled ?? false;

    return [resetPasswordPolicyOptions, policy?.enabled ?? false];
  }

  mapPoliciesFromToken(policiesResponse: ListResponse<PolicyResponse>): Policy[] {
    if (policiesResponse == null || policiesResponse.data == null) {
      return null;
    }

    const policiesData = policiesResponse.data.map((p) => new PolicyData(p));
    return policiesData.map((p) => new Policy(p));
  }

  policyAppliesToUser$(
    policyType: PolicyType,
    policyFilter: (policy: Policy) => boolean = (p) => true,
    userId?: string
  ) {
    return this.policies$.pipe(
      concatMap(async (policies) => {
        return await this.policyAppliesToUser(policies, policyType, policyFilter, userId);
      })
    );
  }

  async upsert(policy: PolicyData): Promise<any> {
    let policies = await this.stateService.getEncryptedPolicies();
    if (policies == null) {
      policies = {};
    }

    policies[policy.id] = policy;

    await this.updateObservables(policies);
    await this.stateService.setEncryptedPolicies(policies);
  }

  async replace(policies: { [id: string]: PolicyData }): Promise<void> {
    await this.updateObservables(policies);
    await this.stateService.setEncryptedPolicies(policies);
  }

  async clear(userId?: string): Promise<void> {
    if (userId == null || userId == (await this.stateService.getUserId())) {
      this._policies.next([]);
    }
    await this.stateService.setEncryptedPolicies(null, { userId: userId });
  }

  private isExcemptFromPolicies(organization: Organization, policyType: PolicyType) {
    if (policyType === PolicyType.MaximumVaultTimeout) {
      return organization.type === OrganizationUserType.Owner;
    }

    return organization.isExemptFromPolicies;
  }

  private async updateObservables(policiesMap: { [id: string]: PolicyData }) {
    const policies = Object.values(policiesMap || {}).map((f) => new Policy(f));

    this._policies.next(policies);
  }

  private async updateVaultTimeoutValue() {
    const userId = await this.stateService.getUserId();
    if (
      await this.policyAppliesToUser(
        this._policies.value,
        PolicyType.MaximumVaultTimeout,
        undefined,
        userId
      )
    ) {
      const vaultTimeout = await this.vaultTimeoutSettingsService.getVaultTimeout(userId);

      const policy = this._policies.value.find(
        (policy) => policy.type === PolicyType.MaximumVaultTimeout
      );

      // Remove negative values, and ensure it's smaller than maximum allowed value according to policy
      let timeout = Math.min(vaultTimeout, policy.data.minutes);

      if (vaultTimeout == null || timeout < 0) {
        timeout = policy.data.minutes;
      }

      // We really shouldn't need to set the value here, but multiple services relies on this value being correct.
      if (vaultTimeout !== timeout) {
        await this.vaultTimeoutSettingsService.setVaultTimeout(timeout, userId);
      }
    }
  }

  private async policyAppliesToUser(
    policies: Policy[],
    policyType: PolicyType,
    policyFilter: (policy: Policy) => boolean = (p) => true,
    userId?: string
  ) {
    const organizations = await this.organizationService.getAll(userId);
    const filteredPolicies = policies.filter(
      (p) => p.type === policyType && p.enabled && policyFilter(p)
    );
    const policySet = new Set(filteredPolicies.map((p) => p.organizationId));

    return organizations.some(
      (o) =>
        o.enabled &&
        o.status >= OrganizationUserStatusType.Accepted &&
        o.usePolicies &&
        policySet.has(o.id) &&
        !this.isExcemptFromPolicies(o, policyType)
    );
  }
}
