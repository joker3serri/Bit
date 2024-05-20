import { DIALOG_DATA, DialogConfig } from "@angular/cdk/dialog";
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { BraintreeServiceAbstraction } from "@bitwarden/common/billing/abstractions/braintree.service.abstraction";
import { StripeServiceAbstraction } from "@bitwarden/common/billing/abstractions/stripe.service.abstraction";
import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { UpdateProviderPaymentInformationRequest } from "@bitwarden/common/billing/models/request/update-provider-payment-information.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService, ToastService } from "@bitwarden/components";

import { CreateClientOrganizationResultType } from "./clients";

type ProviderPaymentFormParams = {
  providerId: string;
  initialPaymentMethod: PaymentMethodType;
};

export enum ProviderPaymentFormResultType {
  Closed = "closed",
  Submitted = "submitted",
}

export const openProviderPaymentForm = (
  dialogService: DialogService,
  dialogConfig: DialogConfig<ProviderPaymentFormParams>,
) =>
  dialogService.open<ProviderPaymentFormResultType, ProviderPaymentFormParams>(
    ProviderPaymentFormComponent,
    dialogConfig,
  );

@Component({
  selector: "app-provider-payment-form",
  templateUrl: "provider-payment-form.component.html",
})
export class ProviderPaymentFormComponent implements OnInit, OnDestroy {
  @Output() providerPaymentMethodUpdated = new EventEmitter();

  private destroy$ = new Subject<void>();

  protected formGroup = this.formBuilder.group({
    paymentMethod: [this.dialogParams.initialPaymentMethod],
    bankInformation: this.formBuilder.group({
      routingNumber: ["", [Validators.required]],
      accountNumber: ["", [Validators.required]],
      accountHolderName: ["", [Validators.required]],
      accountHolderType: ["", [Validators.required]],
    }),
  });
  protected readonly PaymentMethodType = PaymentMethodType;
  protected readonly ResultType = CreateClientOrganizationResultType;

  constructor(
    @Inject(DIALOG_DATA) private dialogParams: ProviderPaymentFormParams,
    private billingApiService: BillingApiServiceAbstraction,
    private braintreeService: BraintreeServiceAbstraction,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private stripeService: StripeServiceAbstraction,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    this.stripeService.loadStripe(
      {
        cardNumber: "#stripe-card-number",
        cardExpiry: "#stripe-card-expiry",
        cardCvc: "#stripe-card-cvc",
      },
      this.dialogParams.initialPaymentMethod === PaymentMethodType.Card,
    );
    this.braintreeService.loadBraintree(
      "#braintree-container",
      this.dialogParams.initialPaymentMethod === PaymentMethodType.PayPal,
    );

    this.formGroup
      .get("paymentMethod")
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.onPaymentMethodChange(type);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stripeService.unloadStripe();
    this.braintreeService.unloadBraintree();
  }

  onPaymentMethodChange(type: PaymentMethodType) {
    switch (type) {
      case PaymentMethodType.Card: {
        this.stripeService.mountElements();
        break;
      }
      case PaymentMethodType.PayPal: {
        this.braintreeService.createDropin();
        break;
      }
    }
  }

  submit = async () => {
    const paymentMethodId = await this.createPaymentMethod();
    const request = new UpdateProviderPaymentInformationRequest();
    request.paymentMethod = {
      type: this.formGroup.value.paymentMethod,
      token: paymentMethodId,
    };
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

  async createPaymentMethod() {
    if (this.usingStripePaymentMethod) {
      const clientSecret = await this.billingApiService.createSetupIntentForProvider(
        this.dialogParams.providerId,
        this.formGroup.value.paymentMethod,
      );

      if (this.usingCard) {
        return await this.stripeService.setupCardPaymentMethod(clientSecret);
      } else if (this.usingBankAccount) {
        return await this.stripeService.setupBankAccountPaymentMethod(clientSecret, {
          accountHolderName: this.formGroup.value.bankInformation.accountHolderName,
          routingNumber: this.formGroup.value.bankInformation.routingNumber,
          accountNumber: this.formGroup.value.bankInformation.accountNumber,
          accountHolderType: this.formGroup.value.bankInformation.accountHolderType,
        });
      }
    } else {
      return await this.braintreeService.requestPaymentMethod();
    }
  }

  get usingStripePaymentMethod() {
    return this.usingCard || this.usingBankAccount;
  }

  get usingCard() {
    return this.formGroup.value.paymentMethod === PaymentMethodType.Card;
  }

  get usingBankAccount() {
    return this.formGroup.value.paymentMethod === PaymentMethodType.BankAccount;
  }
}
