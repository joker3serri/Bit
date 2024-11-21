interface EnterpriseOrgStatus {
  isFreeFamilyPolicyEnabled: boolean;
  belongToOneEnterpriseOrgs: boolean;
  belongToMultipleEnterpriseOrgs: boolean;
}

import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  Subject,
  Observable,
  concatMap,
  filter,
  forkJoin,
  map,
  of,
  switchMap,
  takeUntil,
} from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { ProductTierType } from "@bitwarden/common/billing/enums";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/platform/sync";
import { IconModule } from "@bitwarden/components";

import { FreeFamiliesPolicyService } from "../billing/services/free-families-policy.service";

import { PasswordManagerLogo } from "./password-manager-logo";
import { WebLayoutModule } from "./web-layout.module";

@Component({
  selector: "app-user-layout",
  templateUrl: "user-layout.component.html",
  standalone: true,
  imports: [CommonModule, RouterModule, JslibModule, WebLayoutModule, IconModule],
})
export class UserLayoutComponent implements OnInit {
  protected readonly logo = PasswordManagerLogo;
  protected enterpriseOrgStatus: EnterpriseOrgStatus = {
    isFreeFamilyPolicyEnabled: false,
    belongToOneEnterpriseOrgs: false,
    belongToMultipleEnterpriseOrgs: false,
  };
  isFreeFamilyFlagEnabled: boolean;
  showFreeFamilyLink: boolean;
  protected hasFamilySponsorshipAvailable$: Observable<boolean>;
  protected showSubscription$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private organizationService: OrganizationService,
    private apiService: ApiService,
    private syncService: SyncService,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private freeFamiliesPolicyService: FreeFamiliesPolicyService,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    document.body.classList.remove("layout_frontend");

    await this.syncService.fullSync(false);

    this.isFreeFamilyFlagEnabled = await this.configService.getFeatureFlag(
      FeatureFlag.DisableFreeFamiliesSponsorship,
    );

    if (this.isFreeFamilyFlagEnabled) {
      this.checkEnterpriseOrganizationsAndFetchPolicy()
        .pipe(takeUntil(this.destroy$))
        .subscribe((value: EnterpriseOrgStatus) => {
          this.enterpriseOrgStatus = value;
          this.showFreeFamilyLink = this.shouldShowFreeFamilyLink(this.enterpriseOrgStatus);
        });
    }

    this.hasFamilySponsorshipAvailable$ = this.organizationService.canManageSponsorships$;

    // We want to hide the subscription menu for organizations that provide premium.
    // Except if the user has premium personally or has a billing history.
    this.showSubscription$ = forkJoin([
      this.billingAccountProfileStateService.hasPremiumPersonally$,
      this.billingAccountProfileStateService.hasPremiumFromAnyOrganization$,
    ]).pipe(
      concatMap(async ([hasPremiumPersonally, hasPremiumFromOrg]) => {
        const isCloud = !this.platformUtilsService.isSelfHost();

        let billing = null;
        if (isCloud) {
          // TODO: We should remove the need to call this!
          billing = await this.apiService.getUserBillingHistory();
        }

        const cloudAndBillingHistory = isCloud && !billing?.hasNoHistory;
        return hasPremiumPersonally || !hasPremiumFromOrg || cloudAndBillingHistory;
      }),
    );
  }

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
            return this.freeFamiliesPolicyService
              .getPolicyStatus$(organizationId, PolicyType.FreeFamiliesSponsorshipPolicy)
              .pipe(
                map((isFreeFamilyPolicyEnabled: boolean) => ({
                  isFreeFamilyPolicyEnabled,
                  belongToOneEnterpriseOrgs,
                  belongToMultipleEnterpriseOrgs,
                })),
              );
          }
        }
        return of(response);
      }),
    );
  }

  private shouldShowFreeFamilyLink(orgStatus: EnterpriseOrgStatus): boolean {
    return !(orgStatus.belongToOneEnterpriseOrgs && orgStatus.isFreeFamilyPolicyEnabled);
  }

  private evaluateEnterpriseOrganizations(organizations: any[]): {
    belongToOneEnterpriseOrgs: boolean;
    belongToMultipleEnterpriseOrgs: boolean;
  } {
    const enterpriseOrganizations = organizations.filter(
      (org) => org.productTierType === ProductTierType.Enterprise,
    );
    const count = enterpriseOrganizations.length;

    return {
      belongToOneEnterpriseOrgs: count === 1,
      belongToMultipleEnterpriseOrgs: count > 1,
    };
  }

  private getOrganizationIdForOneEnterprise(organizations: any[]): string | null {
    const enterpriseOrganizations = organizations.filter(
      (org) => org.productTierType === ProductTierType.Enterprise,
    );
    return enterpriseOrganizations.length === 1 ? enterpriseOrganizations[0].id : null;
  }
}
