import { Component, HostBinding, Input } from "@angular/core";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";

export type IconButtonSize = "default" | "small";

const sizes: Record<IconButtonSize, string[]> = {
  default: ["tw-px-2.5", "tw-py-1.5"],
  small: ["tw-leading-none", "tw-text-base", "tw-p-1"],
};

@Component({
  selector: "button[bitIconButton]",
  templateUrl: "icon-button.component.html",
  providers: [{ provide: ButtonLikeAbstraction, useExisting: BitIconButtonComponent }],
})
export class BitIconButtonComponent implements ButtonLikeAbstraction {
  @Input("bitIconButton") icon: string;

  @Input() size: IconButtonSize = "default";

  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-border",
      "tw-border-solid",
      "tw-rounded",
      "tw-transition",
      "hover:tw-no-underline",
      "focus:tw-outline-none",

      // Workaround for box-shadow with transparent offset issue:
      // https://github.com/tailwindlabs/tailwindcss/issues/3595
      // Remove `before:` and use regular `tw-ring` when browser no longer has bug, or better:
      // switch to `outline` with `outline-offset` when Safari supports border radius on outline.
      // Using `box-shadow` to create outlines is a hack and as such `outline` should be preferred.
      "tw-relative",
      "before:tw-content-['']",
      "before:tw-block",
      "before:tw-absolute",
      "before:-tw-inset-[3px]",
      "before:tw-rounded-md",
      "before:tw-transition",
      "before:tw-ring",
      "before:tw-ring-transparent",
      "focus-visible:before:tw-ring-text-contrast",
      "focus-visible:tw-z-10",
    ].concat(sizes[this.size]);
  }

  get iconClass() {
    return [this.icon, "!tw-m-0"];
  }

  @HostBinding("attr.disabled")
  get disabledAttr() {
    const disabled = this.disabled != null && this.disabled !== false;
    return disabled || this.loading ? true : null;
  }

  @Input() loading = false;
  @Input() disabled = false;
}
