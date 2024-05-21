import { DIALOG_DATA, DialogConfig } from "@angular/cdk/dialog";
import { Component, EventEmitter, Inject, Output, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";

import { PaymentMethodComponent } from "@bitwarden/angular/billing/components";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { UpdateProviderPaymentInformationRequest } from "@bitwarden/common/billing/models/request/update-provider-payment-information.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

type ProviderPaymentMethodDialogParams = {
  providerId: string;
};

export enum ProviderPaymentMethodDialogResultType {
  Closed = "closed",
  Submitted = "submitted",
}

export const openProviderPaymentDialog = (
  dialogService: DialogService,
  dialogConfig: DialogConfig<ProviderPaymentMethodDialogParams>,
) =>
  dialogService.open<ProviderPaymentMethodDialogResultType, ProviderPaymentMethodDialogParams>(
    ProviderPaymentMethodDialogComponent,
    dialogConfig,
  );

@Component({
  selector: "app-provider-payment-method-dialog",
  templateUrl: "provider-payment-method-dialog.component.html",
})
export class ProviderPaymentMethodDialogComponent {
  @ViewChild(PaymentMethodComponent)
  selectPaymentMethodComponent: PaymentMethodComponent;
  @Output() providerPaymentMethodUpdated = new EventEmitter();

  protected readonly formGroup = new FormGroup({});
  protected readonly ResultType = ProviderPaymentMethodDialogResultType;

  constructor(
    @Inject(DIALOG_DATA) private dialogParams: ProviderPaymentMethodDialogParams,
    private billingApiService: BillingApiServiceAbstraction,
    private i18nService: I18nService,
    private toastService: ToastService,
  ) {}

  submit = async () => {
    const tokenizedPaymentMethod = await this.selectPaymentMethodComponent.tokenizePaymentMethod();
    const request = new UpdateProviderPaymentInformationRequest();
    request.paymentMethod = tokenizedPaymentMethod;
    await this.billingApiService.updateProviderPaymentInformation(
      this.dialogParams.providerId,
      request,
    );
    this.providerPaymentMethodUpdated.emit();
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedPaymentMethod"),
    });
  };
}
