import { Component, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, concatMap, from, Observable, of } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/platform/sync";
import { ToastService } from "@bitwarden/components";

import { PaymentV2Component } from "../../shared/payment/payment-v2.component";
import { LicenseUploaderFormModel } from "../../shared/self-hosting-license-uploader/license-uploader-form-model";
import { TaxInfoComponent } from "../../shared/tax-info.component";

@Component({
  templateUrl: "./premium-v3.component.html",
})
export class PremiumV3Component {
  @ViewChild(PaymentV2Component) paymentComponent: PaymentV2Component;
  @ViewChild(TaxInfoComponent) taxInfoComponent: TaxInfoComponent;

  readonly licenseUploaderDescription: string = "uploadLicenseFilePremium";
  readonly licenseUploaderHint: string = "bitwarden_premium_license.json";

  protected hasPremiumFromAnyOrganization$: Observable<boolean>;

  protected addOnFormGroup = new FormGroup({
    additionalStorage: new FormControl<number>(0, [Validators.min(0), Validators.max(99)]),
  });

  protected cloudWebVaultURL: string;
  protected isSelfHost = false;

  protected readonly familyPlanMaxUserCount = 6;
  protected readonly premiumPrice = 10;
  protected readonly storageGBPrice = 4;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private environmentService: EnvironmentService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private router: Router,
    private syncService: SyncService,
    private toastService: ToastService,
  ) {
    this.isSelfHost = this.platformUtilsService.isSelfHost();

    this.hasPremiumFromAnyOrganization$ =
      this.billingAccountProfileStateService.hasPremiumFromAnyOrganization$;

    combineLatest([
      this.billingAccountProfileStateService.hasPremiumPersonally$,
      this.environmentService.cloudWebVaultUrl$,
    ])
      .pipe(
        takeUntilDestroyed(),
        concatMap(([hasPremiumPersonally, cloudWebVaultURL]) => {
          if (hasPremiumPersonally) {
            return from(this.navigateToSubscriptionPage());
          }

          this.cloudWebVaultURL = cloudWebVaultURL;
          return of(true);
        }),
      )
      .subscribe();
  }

  postFinalizeUpgrade = async () => {
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("premiumUpdated"),
    });
    await this.navigateToSubscriptionPage();
  };

  finalizeUpgrade = async () => {
    await this.apiService.refreshIdentityToken();
    await this.syncService.fullSync(true);
  };

  navigateToSubscriptionPage = (): Promise<boolean> =>
    this.router.navigate(["../user-subscription"], { relativeTo: this.activatedRoute });

  submitPayment = async (): Promise<void> => {
    this.taxInfoComponent.taxFormGroup.markAllAsTouched();
    if (this.taxInfoComponent.taxFormGroup.invalid) {
      return;
    }

    const { type, token } = await this.paymentComponent.tokenize();

    const formData = new FormData();
    formData.append("paymentMethodType", type.toString());
    formData.append("paymentToken", token);
    formData.append("additionalStorageGb", this.addOnFormGroup.value.additionalStorage.toString());
    formData.append("country", this.taxInfoComponent.country);
    formData.append("postalCode", this.taxInfoComponent.postalCode);

    await this.apiService.postPremium(formData);
    await this.finalizeUpgrade();
    await this.postFinalizeUpgrade();
  };

  protected get additionalStorageCost(): number {
    return this.storageGBPrice * this.addOnFormGroup.value.additionalStorage;
  }

  protected get estimatedTax(): number {
    return this.taxInfoComponent?.taxRate != null
      ? (this.taxInfoComponent.taxRate / 100) * this.subtotal
      : 0;
  }

  protected get premiumURL(): string {
    return `${this.cloudWebVaultURL}/#/settings/subscription/premium`;
  }

  protected get subtotal(): number {
    return this.premiumPrice + this.additionalStorageCost;
  }

  protected get total(): number {
    return this.subtotal + this.estimatedTax;
  }

  protected async onLicenseFileSelectedChanged(
    LicenseUploaderFormModel: LicenseUploaderFormModel,
  ): Promise<void> {
    await this.postFinalizeUpgrade();
  }
}
