import { BraintreeServiceAbstraction } from "@bitwarden/common/billing/abstractions/braintree.service.abstraction";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

export class BraintreeService implements BraintreeServiceAbstraction {
  private braintree: any;

  constructor(private logService: LogService) {}

  loadBraintree(containerId: string) {
    const script = window.document.createElement("script");
    script.id = "dropin-script";
    script.src = `scripts/dropin.js?cache=${process.env.CACHE_TAG}`;
    script.async = true;
    script.onload = () => {
      window.setTimeout(() => {
        const window$ = window as any;
        window$.braintree.dropin.create(
          {
            authorization: process.env.BRAINTREE_KEY,
            container: containerId,
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
    };
    window.document.head.appendChild(script);
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
