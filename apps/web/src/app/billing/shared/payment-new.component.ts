import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { AbstractThemingService } from "@bitwarden/angular/platform/services/theming/theming.service.abstraction";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

@Component({
  selector: "app-payment-new",
  templateUrl: "payment-new.component.html",
})
export class PaymentNewComponent implements OnInit, OnDestroy {
  private stripe: any;
  private destroy$ = new Subject<void>();

  constructor(
    private logService: LogService,
    private themingService: AbstractThemingService,
  ) {}

  async ngOnInit() {
    this.subscribeToTheme();
    this.loadStripe();
    this.loadDropin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unloadStripe();
    this.unloadBraintree();
  }

  private stripeElementOptions: any = {
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

  private getDropinScript(): HTMLScriptElement {
    const script = window.document.createElement("script");
    script.id = "dropin-script";
    script.src = `scripts/dropin.js?cache=${process.env.CACHE_TAG}`;
    script.async = true;
    return script;
  }

  private getStripeScript(): HTMLScriptElement {
    const script = window.document.createElement("script");
    script.id = "stripe-script";
    script.src = "https://js.stripe.com/v3?advancedFraudSignals=false";
    script.onload = () => {
      const window$ = window as any;
      this.stripe = window$.Stripe(process.env.STRIPE_KEY);
      const elements = this.stripe.elements();

      window.setTimeout(() => {
        const cardNumber = elements.create("cardNumber", this.stripeElementOptions);
        const cardExpiry = elements.create("cardExpiry", this.stripeElementOptions);
        const cardCvc = elements.create("cardCvc", this.stripeElementOptions);
        cardNumber.mount("#stripe-card-number");
        cardExpiry.mount("#stripe-card-expiry");
        cardCvc.mount("#stripe-card-cvc");
      }, 50);
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

  private subscribeToTheme() {
    this.themingService.theme$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const style = getComputedStyle(document.documentElement);
      this.stripeElementOptions.style.base.color = `rgb(${style.getPropertyValue("--color-text-main")})`;
      this.stripeElementOptions.style.base["::placeholder"].color = `rgb(${style.getPropertyValue(
        "--color-text-muted",
      )})`;
      this.stripeElementOptions.style.invalid.color = `rgb(${style.getPropertyValue("--color-text-main")})`;
      this.stripeElementOptions.style.invalid.borderColor = `rgb(${style.getPropertyValue(
        "--color-danger-600",
      )})`;
    });
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
