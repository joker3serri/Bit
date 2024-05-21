import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { from, lastValueFrom, Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import {
  fromTaxInfoResponse,
  TaxInformation,
} from "@bitwarden/common/billing/models/domain/tax-information";
import { UpdateProviderPaymentRequest } from "@bitwarden/common/billing/models/request/update-provider-payment.request";
import { TaxInfoResponse } from "@bitwarden/common/billing/models/response/tax-info.response";
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
  protected taxInformation: TaxInformation;

  private destroy$ = new Subject<void>();

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private i18nService: I18nService,
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
    // TODO: Retrieve tax information
    const taxInfoResponse = new TaxInfoResponse({
      Country: "US",
      PostalCode: "12345",
    });
    this.taxInformation = fromTaxInfoResponse(taxInfoResponse);
  }

  updateTaxInformation = async (taxInformation: TaxInformation) => {
    const updateProviderPaymentRequest = new UpdateProviderPaymentRequest();
    updateProviderPaymentRequest.taxInformation = taxInformation;
    await this.billingApiService.updateProviderPayment(
      this.providerId,
      updateProviderPaymentRequest,
    );
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedTaxInformation"),
    });
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
}
