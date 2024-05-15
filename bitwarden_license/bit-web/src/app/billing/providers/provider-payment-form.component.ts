import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Subject } from "rxjs";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { ToastService } from "@bitwarden/components";

@Component({
  selector: "app-provider-payment-form",
  templateUrl: "provider-payment-form.component.html",
})
export class ProviderPaymentFormComponent implements OnInit, OnDestroy {
  @Input() selectedPaymentMethod: PaymentMethodType = PaymentMethodType.Card;
  protected formGroup = this.formBuilder.group({
    paymentMethod: [this.selectedPaymentMethod],
  });
  protected readonly PaymentMethodType = PaymentMethodType;

  private destroy$ = new Subject<void>();
  private braintree: any;
  private stripe: any;
  private elements: any;

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    private formBuilder: FormBuilder,
    private logService: LogService,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    this.loadStripe();
    this.loadDropin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unloadStripe();
    this.unloadBraintree();
  }

  submit = async () => {
    if (this.formGroup.value.paymentMethod === PaymentMethodType.Card) {
      const clientSecret = await this.billingApiService.setupIntent();
      const cardNumber = this.elements.getElement("cardNumber");
      const result = await this.stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
        },
      });
      if (result.error || (result.setupIntent && result.setupIntent.status !== "succeeded")) {
        this.logService.error(result.error);
        this.toastService.showToast({
          variant: "error",
          title: null,
          message: result.error.message,
        });
      } else {
        return [result.setupIntent.payment_method, this.formGroup.value.paymentMethod];
      }
    }
  };

  protected changePaymentMethod() {
    if (this.selectedPaymentMethod === PaymentMethodType.PayPal) {
      this.createBraintreeDropin();
    } else {
      this.mountStripeElements();
    }
  }

  private createBraintreeDropin() {
    window.setTimeout(() => {
      const window$ = window as any;
      window$.braintree.dropin.create(
        {
          authorization: process.env.BRAINTREE_KEY,
          container: "#braintree-container",
          paymentOptionPriority: ["paypal"],
          paypal: {
            flow: "vault",
            buttonStyle: {
              label: "pay",
              size: "medium",
              shape: "pill",
              color: "blue",
              tagline: "false",
            },
          },
        },
        (error: any, instance: any) => {
          if (error != null) {
            this.logService.error(error);
            return;
          }
          this.braintree = instance;
        },
      );
    }, 250);
  }

  private getDropinScript(): HTMLScriptElement {
    const script = window.document.createElement("script");
    script.id = "dropin-script";
    script.src = `scripts/dropin.js?cache=${process.env.CACHE_TAG}`;
    script.async = true;
    return script;
  }

  private getStripeElementOptions(): any {
    const options: any = {
      style: {
        base: {
          color: null,
          fontFamily:
            '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif, ' +
            '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          fontSize: "14px",
          fontSmoothing: "antialiased",
          "::placeholder": {
            color: null,
          },
        },
        invalid: {
          color: null,
        },
      },
      classes: {
        focus: "is-focused",
        empty: "is-empty",
        invalid: "is-invalid",
      },
    };

    const style = getComputedStyle(document.documentElement);
    options.style.base.color = `rgb(${style.getPropertyValue("--color-text-main")})`;
    options.style.base["::placeholder"].color = `rgb(${style.getPropertyValue(
      "--color-text-muted",
    )})`;
    options.style.invalid.color = `rgb(${style.getPropertyValue("--color-text-main")})`;
    options.style.invalid.borderColor = `rgb(${style.getPropertyValue("--color-danger-600")})`;

    return options;
  }

  private getStripeScript(): HTMLScriptElement {
    const script = window.document.createElement("script");
    script.id = "stripe-script";
    script.src = "https://js.stripe.com/v3?advancedFraudSignals=false";
    script.onload = () => {
      const window$ = window as any;
      this.stripe = window$.Stripe(process.env.STRIPE_KEY);
      this.mountStripeElements();
    };

    return script;
  }

  private loadDropin() {
    const script = this.getDropinScript();
    window.document.head.appendChild(script);
  }

  private loadStripe() {
    const script = this.getStripeScript();
    window.document.head.appendChild(script);
  }

  private mountStripeElements() {
    this.elements = this.stripe.elements();
    const options = this.getStripeElementOptions();
    window.setTimeout(() => {
      const cardNumber = this.elements.create("cardNumber", options);
      const cardExpiry = this.elements.create("cardExpiry", options);
      const cardCvc = this.elements.create("cardCvc", options);
      cardNumber.mount("#stripe-card-number");
      cardExpiry.mount("#stripe-card-expiry");
      cardCvc.mount("#stripe-card-cvc");
    }, 50);
  }

  private unloadBraintree() {
    const script = window.document.getElementById("dropin-script");
    window.document.head.removeChild(script);
    window.setTimeout(() => {
      const scripts = Array.from(window.document.head.querySelectorAll("script")).filter(
        (script) => script.src != null && script.src.indexOf("paypal") > -1,
      );
      scripts.forEach((script) => {
        this.attempt(() => window.document.head.removeChild(script));
      });
      const stylesheet = window.document.head.querySelector("#braintree-dropin-stylesheet");
      if (stylesheet != null) {
        this.attempt(() => window.document.head.removeChild(stylesheet));
      }
    }, 500);
  }

  private unloadStripe() {
    const script = window.document.getElementById("stripe-script");
    window.document.head.removeChild(script);
    window.setTimeout(() => {
      const iFrames = Array.from(window.document.querySelectorAll("iframe")).filter(
        (element) => element.src != null && element.src.indexOf("stripe") > -1,
      );
      iFrames.forEach((iFrame) => {
        this.attempt(() => window.document.body.removeChild(iFrame));
      });
    }, 500);
  }

  private attempt(func: () => void) {
    try {
      func();
    } catch (error) {
      this.logService.error(error);
    }
  }
}
