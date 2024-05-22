import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { from, lastValueFrom, Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ProviderBillingClientAbstraction } from "@bitwarden/common/billing/abstractions/clients/provider-billing.client.abstraction";
import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { PaymentMethod } from "@bitwarden/common/billing/models/domain/payment-method";
import { TaxInformation } from "@bitwarden/common/billing/models/domain/tax-information";
import {
  ExpandedTaxInfoUpdateRequest,
  VerifyBankAccountRequest,
} from "@bitwarden/common/billing/models/request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

import {
  openProviderPaymentDialog,
  ProviderPaymentMethodDialogResultType,
} from "./provider-payment-method-dialog.component";

@Component({
  selector: "app-provider-payment",
  templateUrl: "./provider-payment.component.html",
})
export class ProviderPaymentComponent implements OnInit, OnDestroy {
  protected providerId: string;
  protected loading: boolean;

  protected paymentMethod: PaymentMethod;
  protected taxInformation: TaxInformation;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private i18nService: I18nService,
    private providerBillingClient: ProviderBillingClientAbstraction,
    private toastService: ToastService,
  ) {}

  changePaymentMethod = async () => {
    const dialogRef = openProviderPaymentDialog(this.dialogService, {
      data: {
        providerId: this.providerId,
      },
    });

    const result = await lastValueFrom(dialogRef.closed);

    if (result == ProviderPaymentMethodDialogResultType.Submitted) {
      await this.load();
    }
  };

  async load() {
    this.loading = true;
    this.paymentMethod = PaymentMethod.from(
      await this.providerBillingClient.getPaymentMethod(this.providerId),
    );
    this.taxInformation = TaxInformation.from(
      await this.providerBillingClient.getTaxInformation(this.providerId),
    );
    if (this.taxInformation === null) {
      this.taxInformation = TaxInformation.empty();
    }
    this.loading = false;
  }

  onDataUpdated = async () => await this.load();

  updateTaxInformation = async (taxInformation: TaxInformation) => {
    const request = ExpandedTaxInfoUpdateRequest.From(taxInformation);
    await this.providerBillingClient.updateTaxInformation(this.providerId, request);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedTaxInformation"),
    });
  };

  verifyBankAccount = async (amount1: number, amount2: number) => {
    const request = new VerifyBankAccountRequest(amount1, amount2);
    await this.providerBillingClient.verifyBankAccount(this.providerId, request);
  };

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap(({ providerId }) => {
          this.providerId = providerId;
          return from(this.load());
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected get hasPaymentMethod(): boolean {
    return !!this.paymentMethod;
  }

  protected get hasUnverifiedPaymentMethod(): boolean {
    return !!this.paymentMethod && this.paymentMethod.needsVerification;
  }

  protected get paymentMethodClass(): string[] {
    switch (this.paymentMethod.type) {
      case PaymentMethodType.Card:
        return ["bwi-credit-card"];
      case PaymentMethodType.BankAccount:
        return ["bwi-bank"];
      case PaymentMethodType.PayPal:
        return ["bwi-paypal tw-text-primary"];
      default:
        return [];
    }
  }
}
