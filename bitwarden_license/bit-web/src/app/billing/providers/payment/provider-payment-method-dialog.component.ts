import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, EventEmitter, Inject, Output, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";

import { PaymentMethodComponent } from "@bitwarden/angular/billing/components";
import { ProviderBillingClientAbstraction } from "@bitwarden/common/billing/abstractions/clients/provider-billing.client.abstraction";
import { TokenizedPaymentMethodRequest } from "@bitwarden/common/billing/models/request";
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
    private dialogRef: DialogRef<ProviderPaymentMethodDialogResultType>,
    private i18nService: I18nService,
    private providerBillingClient: ProviderBillingClientAbstraction,
    private toastService: ToastService,
  ) {}

  submit = async () => {
    const tokenizedPaymentMethod = await this.selectPaymentMethodComponent.tokenizePaymentMethod();
    const request = TokenizedPaymentMethodRequest.From(tokenizedPaymentMethod);
    await this.providerBillingClient.updatePaymentMethod(this.dialogParams.providerId, request);
    this.providerPaymentMethodUpdated.emit();
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("updatedPaymentMethod"),
    });
    this.dialogRef.close(this.ResultType.Submitted);
  };
}
