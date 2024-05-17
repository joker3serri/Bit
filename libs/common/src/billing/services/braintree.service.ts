import { BraintreeServiceAbstraction } from "@bitwarden/common/billing/abstractions/braintree.service.abstraction";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

export class BraintreeService implements BraintreeServiceAbstraction {
  private braintree: any;
  private containerId: string;

  constructor(private logService: LogService) {}

  createDropin() {
    window.setTimeout(() => {
      const window$ = window as any;
      window$.braintree.dropin.create(
        {
          authorization: process.env.BRAINTREE_KEY,
          container: this.containerId,
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

  loadBraintree(containerId: string, autoCreateDropin: boolean) {
    const script = window.document.createElement("script");
    script.id = "dropin-script";
    script.src = `scripts/dropin.js?cache=${process.env.CACHE_TAG}`;
    script.async = true;
    if (autoCreateDropin) {
      script.onload = () => this.createDropin();
    }
    this.containerId = containerId;
    window.document.head.appendChild(script);
  }

  requestPaymentMethod() {
    return this.braintree.requestPaymentMethod((error: any, payload: any) => {
      if (error) {
        this.logService.error(error);
        throw error;
      } else {
        return payload.nonce as string;
      }
    });
  }

  unloadBraintree() {
    const script = window.document.getElementById("dropin-script");
    window.document.head.removeChild(script);
    window.setTimeout(() => {
      const scripts = Array.from(window.document.head.querySelectorAll("script")).filter(
        (script) => script.src != null && script.src.indexOf("paypal") > -1,
      );
      scripts.forEach((script) => {
        try {
          window.document.head.removeChild(script);
        } catch (error) {
          this.logService.error(error);
        }
      });
      const stylesheet = window.document.head.querySelector("#braintree-dropin-stylesheet");
      if (stylesheet != null) {
        try {
          window.document.head.removeChild(stylesheet);
        } catch (error) {
          this.logService.error(error);
        }
      }
    }, 500);
  }
}
