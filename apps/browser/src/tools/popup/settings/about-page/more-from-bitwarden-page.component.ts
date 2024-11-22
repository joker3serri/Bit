import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable, firstValueFrom, map, of, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { DialogService } from "@bitwarden/components";

import { BrowserApi } from "../../../../platform/browser/browser-api";
import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";

@Component({
  templateUrl: "more-from-bitwarden-page.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, RouterModule, PopOutComponent],
})
export class MoreFromBitwardenPageComponent {
  canAccessPremium$: Observable<boolean>;
  protected isFreeFamilyPolicyEnabled$: Observable<boolean>;
  protected hasSingleEnterpriseOrg$: Observable<boolean>;

  constructor(
    private dialogService: DialogService,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private environmentService: EnvironmentService,
    private organizationService: OrganizationService,
    private policyService: PolicyService,
  ) {
    this.canAccessPremium$ = billingAccountProfileStateService.hasPremiumFromAnySource$;
    this.hasSingleEnterpriseOrg$ = this.organizationService
      .getAll$()
      .pipe(
        map(
          (organizations) => organizations.filter((org) => org.canManageSponsorships).length === 1,
        ),
      );

    this.isFreeFamilyPolicyEnabled$ = this.organizationService.getAll$().pipe(
      map((organizations) => organizations.filter((org) => org.canManageSponsorships)),
      switchMap((enterpriseOrgs) => {
        if (enterpriseOrgs.length === 1) {
          const enterpriseOrgId = enterpriseOrgs[0].id;
          return this.policyService
            .getAll$(PolicyType.FreeFamiliesSponsorshipPolicy)
            .pipe(
              map(
                (policies) =>
                  policies.find((policy) => policy.organizationId === enterpriseOrgId)?.enabled ??
                  false,
              ),
            );
        }
        return of(false);
      }),
    );
  }

  async openFreeBitwardenFamiliesPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToWebApp" },
      content: { key: "freeBitwardenFamiliesPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      const env = await firstValueFrom(this.environmentService.environment$);
      const url = env.getWebVaultUrl();
      await BrowserApi.createNewTab(url + "/#/settings/sponsored-families");
    }
  }

  async openBitwardenForBusinessPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "bitwardenForBusinessPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/business/");
    }
  }

  async openAuthenticatorPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToAuthenticatorPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/authenticator");
    }
  }

  async openSecretsManagerPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToSecretsManagerPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/secrets-manager");
    }
  }

  async openPasswordlessDotDevPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToPasswordlessDotDevPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/passwordless");
    }
  }
}
