import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { BraintreeServiceAbstraction } from "@bitwarden/common/billing/abstractions/braintree.service.abstraction";
import { StripeServiceAbstraction } from "@bitwarden/common/billing/abstractions/stripe.service.abstraction";
import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { UpdateProviderPaymentInformationRequest } from "@bitwarden/common/billing/models/request/update-provider-payment-information.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { ToastService } from "@bitwarden/components";

@Component({
  selector: "app-provider-payment-form",
  templateUrl: "provider-payment-form.component.html",
})
export class ProviderPaymentFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) providerId: string;
  @Input() initialPaymentMethod = PaymentMethodType.Card;
  @Output() providerPaymentMethodUpdated = new EventEmitter();

  private destroy$ = new Subject<void>();

  protected formGroup = this.formBuilder.group({
    paymentMethod: [this.initialPaymentMethod],
    bankInformation: this.formBuilder.group({
      routingNumber: ["", [Validators.required]],
      accountNumber: ["", [Validators.required]],
      accountHolderName: ["", [Validators.required]],
      accountHolderType: ["", [Validators.required]],
    }),
  });
  protected readonly PaymentMethodType = PaymentMethodType;

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    private braintreeService: BraintreeServiceAbstraction,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private stripeService: StripeServiceAbstraction,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    this.stripeService.loadStripe({
      cardNumber: "#stripe-card-number",
      cardExpiry: "#stripe-card-expiry",
      cardCvc: "#stripe-card-cvc",
    });
    this.braintreeService.loadBraintree("#braintree-container");

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
        this.stripeService.remountElements();
      }
    }
  }

  submit = async () => {
    switch (this.formGroup.value.paymentMethod) {
      case PaymentMethodType.Card: {
        const clientSecret = await this.billingApiService.setupCardIntent();
        const paymentMethodId = await this.stripeService.setupCardPaymentMethod(clientSecret);
        const request = new UpdateProviderPaymentInformationRequest();
        request.paymentMethod = {
          type: this.formGroup.value.paymentMethod,
          token: paymentMethodId,
        };
        await this.billingApiService.updateProviderPaymentInformation(this.providerId, request);
        this.providerPaymentMethodUpdated.emit();
        this.toastService.showToast({
          variant: "success",
          title: null,
          message: this.i18nService.t("updatedPaymentMethod"),
        });
        break;
      }
      case PaymentMethodType.BankAccount: {
        const clientSecret = await this.billingApiService.setupProviderBankAccountIntent(
          this.providerId,
        );
        await this.stripeService.setupBankAccountPaymentMethod(clientSecret, {
          accountHolderName: this.formGroup.value.bankInformation.accountHolderName,
          routingNumber: this.formGroup.value.bankInformation.routingNumber,
          accountNumber: this.formGroup.value.bankInformation.accountNumber,
          accountHolderType: this.formGroup.value.bankInformation.accountHolderType,
        });
        break;
      }
    }
  };
}
