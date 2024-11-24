interface EnterpriseOrgStatus {
  isFreeFamilyPolicyEnabled: boolean;
  belongToOneEnterpriseOrgs: boolean;
  belongToMultipleEnterpriseOrgs: boolean;
}

import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subject, Observable, concatMap, forkJoin, takeUntil, combineLatest, map, of } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
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
  protected hasFamilySponsorshipAvailable$: Observable<boolean>;
  protected showSponsoredFamilies$: Observable<boolean>;
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

    let enterpriseOrgStatus$: Observable<EnterpriseOrgStatus> = of(null); // Default to a no-op observable.

    if (this.isFreeFamilyFlagEnabled) {
      enterpriseOrgStatus$ = this.freeFamiliesPolicyService
        .checkEnterpriseOrganizationsAndFetchPolicy()
        .pipe(takeUntil(this.destroy$));
    }

    this.showSponsoredFamilies$ = combineLatest([
      enterpriseOrgStatus$,
      this.organizationService.canManageSponsorships$,
    ]).pipe(
      map(([orgStatus, canManageSponsorships]) => {
        const showFreeFamilyLink =
          orgStatus &&
          !(orgStatus.belongToOneEnterpriseOrgs && orgStatus.isFreeFamilyPolicyEnabled);
        return canManageSponsorships && showFreeFamilyLink;
      }),
    );

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
}
