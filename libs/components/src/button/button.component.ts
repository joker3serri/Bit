import { Input, HostBinding, Component } from "@angular/core";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";

@Component({
  selector: "button[bitButton], a[bitButton]",
  templateUrl: "button.component.html",
  providers: [{ provide: ButtonLikeAbstraction, useExisting: ButtonComponent }],
})
export class ButtonComponent implements ButtonLikeAbstraction {
  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-py-1.5",
      "tw-px-3",
      "tw-rounded",
      "tw-transition",
      "tw-border",
      "tw-border-solid",
      "tw-text-center",
      "hover:tw-no-underline",
      "focus:tw-outline-none",
      "focus-visible:tw-ring",
      "focus-visible:tw-ring-offset-2",
      "focus-visible:tw-ring-primary-700",
      "focus-visible:tw-z-10",
    ].concat(
      this.block == null || this.block === false ? ["tw-inline-block"] : ["tw-w-full", "tw-block"]
    );
  }

  @HostBinding("attr.disabled")
  get disabledAttr() {
    const disabled = this.disabled != null && this.disabled !== false;
    return disabled || this.loading ? true : null;
  }

  @Input() block?: boolean;
  @Input() loading = false;
  @Input() disabled = false;
}
