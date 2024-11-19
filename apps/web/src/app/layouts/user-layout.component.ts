import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable, combineLatest, concatMap, filter, firstValueFrom, map, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { ProductTierType } from "@bitwarden/common/billing/enums";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/platform/sync";
import { IconModule } from "@bitwarden/components";

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
  protected enterpriseOrgStatus = {
    isFreeFamilyPolicyEnabled: false,
    belongToOneEnterpriseOrgs: false,
    belongToMultipleEnterpriseOrgs: false,
  };
  isFreeFamilyFlagEnabled: boolean;
  showFreeFamilyLink: boolean;
  protected hasFamilySponsorshipAvailable$: Observable<boolean>;
  protected showSubscription$: Observable<boolean>;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private organizationService: OrganizationService,
    private apiService: ApiService,
    private syncService: SyncService,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private PolicyApiService: PolicyApiServiceAbstraction,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    document.body.classList.remove("layout_frontend");

    await this.syncService.fullSync(false);

    this.isFreeFamilyFlagEnabled = await this.configService.getFeatureFlag(
      FeatureFlag.IdpAutoSubmitLogin,
    );

    if (this.isFreeFamilyFlagEnabled) {
      this.enterpriseOrgStatus = await this.checkEnterpriseOrganizationsAndFetchPolicy();
      this.showFreeFamilyLink = !(
        this.enterpriseOrgStatus.belongToOneEnterpriseOrgs &&
        this.enterpriseOrgStatus.isFreeFamilyPolicyEnabled
      );
    }
    this.hasFamilySponsorshipAvailable$ = this.organizationService.canManageSponsorships$;

    // We want to hide the subscription menu for organizations that provide premium.
    // Except if the user has premium personally or has a billing history.
    this.showSubscription$ = combineLatest([
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

  async checkEnterpriseOrganizationsAndFetchPolicy(): Promise<{
    isFreeFamilyPolicyEnabled: boolean;
    belongToOneEnterpriseOrgs: boolean;
    belongToMultipleEnterpriseOrgs: boolean;
  }> {
    const result$ = this.organizationService.organizations$.pipe(
      filter((organizations) => Array.isArray(organizations) && organizations.length > 0),
      map((organizations) => ({
        ...this.evaluateEnterpriseOrganizations(organizations),
        organizations,
      })),
      switchMap(
        async ({ belongToOneEnterpriseOrgs, belongToMultipleEnterpriseOrgs, organizations }) => {
          let isFreeFamilyPolicyEnabled = false;

          if (belongToOneEnterpriseOrgs) {
            const organizationId = this.getOrganizationIdForOneEnterprise(organizations);
            if (organizationId) {
              const freeFamilyPolicyEnabled = await this.PolicyApiService.getPolicyStatus(
                organizationId,
                PolicyType.FreeFamiliesSponsorshipPolicy,
              );
              isFreeFamilyPolicyEnabled = freeFamilyPolicyEnabled;
            }
          }

          return {
            isFreeFamilyPolicyEnabled,
            belongToOneEnterpriseOrgs,
            belongToMultipleEnterpriseOrgs,
          };
        },
      ),
    );
    return firstValueFrom(result$);
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
