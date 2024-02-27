import { Directive, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { DialogService } from "@bitwarden/components";

@Directive()
export class PremiumComponent implements OnInit, OnDestroy {
  isPremium = false;
  price = 10;
  refreshPromise: Promise<any>;
  cloudWebVaultUrl: string;
  private directiveIsDestroyed$ = new Subject<boolean>();

  constructor(
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected apiService: ApiService,
    private logService: LogService,
    protected stateService: StateService,
    protected dialogService: DialogService,
    environmentService: EnvironmentService,
    private billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {
    this.cloudWebVaultUrl = environmentService.getCloudWebVaultUrl();
  }

  ngOnInit() {
    this.billingAccountProfileStateService.canAccessPremium$
      .pipe(takeUntil(this.directiveIsDestroyed$))
      .subscribe((canAccessPremium: boolean) => (this.isPremium = canAccessPremium));
  }

  ngOnDestroy() {
    this.directiveIsDestroyed$.next(true);
    this.directiveIsDestroyed$.complete();
  }

  async refresh() {
    try {
      this.refreshPromise = this.apiService.refreshIdentityToken();
      await this.refreshPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("refreshComplete"));
    } catch (e) {
      this.logService.error(e);
    }
  }

  async purchase() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "premiumPurchase" },
      content: { key: "premiumPurchaseAlert" },
      type: "info",
    });

    if (confirmed) {
      this.platformUtilsService.launchUri(
        `${this.cloudWebVaultUrl}/#/settings/subscription/premium`,
      );
    }
  }

  async manage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "premiumManage" },
      content: { key: "premiumManageAlert" },
      type: "info",
    });

    if (confirmed) {
      this.platformUtilsService.launchUri(
        `${this.cloudWebVaultUrl}/#/settings/subscription/premium`,
      );
    }
  }
}
