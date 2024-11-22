import { Injectable } from "@angular/core";
import { filter, map, Observable, of, switchMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";

interface EnterpriseOrgStatus {
  isFreeFamilyPolicyEnabled: boolean;
  belongToOneEnterpriseOrgs: boolean;
  belongToMultipleEnterpriseOrgs: boolean;
}

@Injectable({ providedIn: "root" })
export class FreeFamiliesPolicyService {
  protected enterpriseOrgStatus: EnterpriseOrgStatus = {
    isFreeFamilyPolicyEnabled: false,
    belongToOneEnterpriseOrgs: false,
    belongToMultipleEnterpriseOrgs: false,
  };

  constructor(
    private policyService: PolicyService,
    private organizationService: OrganizationService,
  ) {}

  checkEnterpriseOrganizationsAndFetchPolicy(): Observable<EnterpriseOrgStatus> {
    return this.organizationService.organizations$.pipe(
      filter((organizations) => Array.isArray(organizations) && organizations.length > 0),
      map((organizations) => ({
        ...this.evaluateEnterpriseOrganizations(organizations),
        organizations,
      })),
      switchMap(({ belongToOneEnterpriseOrgs, belongToMultipleEnterpriseOrgs, organizations }) => {
        const response = {
          isFreeFamilyPolicyEnabled: false,
          belongToOneEnterpriseOrgs,
          belongToMultipleEnterpriseOrgs,
        };

        if (belongToOneEnterpriseOrgs) {
          const organizationId = this.getOrganizationIdForOneEnterprise(organizations);
          if (organizationId) {
            return this.policyService.getAll$(PolicyType.FreeFamiliesSponsorshipPolicy).pipe(
              map((policies) => {
                const isFreeFamilyPolicyEnabled = policies.some(
                  (policy) => policy.organizationId === organizationId && policy.enabled,
                );
                return {
                  isFreeFamilyPolicyEnabled,
                  belongToOneEnterpriseOrgs,
                  belongToMultipleEnterpriseOrgs,
                };
              }),
            );
          }
        }
        return of(response);
      }),
    );
  }

  private evaluateEnterpriseOrganizations(organizations: any[]): {
    belongToOneEnterpriseOrgs: boolean;
    belongToMultipleEnterpriseOrgs: boolean;
  } {
    const enterpriseOrganizations = organizations.filter((org) => org.canManageSponsorships);
    const count = enterpriseOrganizations.length;

    return {
      belongToOneEnterpriseOrgs: count === 1,
      belongToMultipleEnterpriseOrgs: count > 1,
    };
  }

  private getOrganizationIdForOneEnterprise(organizations: any[]): string | null {
    const enterpriseOrganizations = organizations.filter((org) => org.canManageSponsorships);
    return enterpriseOrganizations.length === 1 ? enterpriseOrganizations[0].id : null;
  }
}
