import { Injectable } from "@angular/core";
import { map, Observable, of, switchMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";

@Injectable({ providedIn: "root" })
export class FamiliesPolicyService {
  constructor(
    private policyService: PolicyService,
    private organizationService: OrganizationService,
  ) {}

  hasSingleEnterpriseOrg$(): Observable<boolean> {
    return this.organizationService
      .getAll$()
      .pipe(
        map(
          (organizations) => organizations.filter((org) => org.canManageSponsorships).length === 1,
        ),
      );
  }

  isFreeFamilyPolicyEnabled$(): Observable<boolean> {
    return this.hasSingleEnterpriseOrg$().pipe(
      switchMap((hasSingleEnterpriseOrg) => {
        if (hasSingleEnterpriseOrg) {
          return this.organizationService.getAll$().pipe(
            map((organizations) => organizations.find((org) => org.canManageSponsorships)?.id),
            switchMap((enterpriseOrgId) =>
              this.policyService
                .getAll$(PolicyType.FreeFamiliesSponsorshipPolicy)
                .pipe(
                  map(
                    (policies) =>
                      policies.find((policy) => policy.organizationId === enterpriseOrgId)
                        ?.enabled ?? false,
                  ),
                ),
            ),
          );
        }
        return of(false);
      }),
    );
  }
}
