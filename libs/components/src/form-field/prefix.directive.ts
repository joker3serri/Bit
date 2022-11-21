import { Directive, HostBinding, Input, OnInit, Optional } from "@angular/core";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";

export const PrefixClasses = [
  "tw-bg-background-alt",
  "tw-border",
  "tw-border-solid",
  "tw-border-secondary-500",
  "tw-text-muted",
  "tw-rounded-none",
];

export const PrefixButtonClasses = [
  "hover:tw-bg-text-muted",
  "hover:tw-text-contrast",
  "disabled:tw-opacity-100",
  "disabled:tw-bg-secondary-100",
  "disabled:hover:tw-bg-secondary-100",
  "disabled:hover:tw-text-muted",
];

export const PrefixStaticContentClasses = ["tw-block", "tw-px-3", "tw-py-1.5"];

@Directive({
  selector: "[bitPrefix]",
})
export class BitPrefixDirective implements OnInit {
  constructor(@Optional() private buttonComponent: ButtonLikeAbstraction) {}

  @HostBinding("class") @Input() get classList() {
    return PrefixClasses.concat(["tw-border-r-0", "first:tw-rounded-l"]).concat(
      this.buttonComponent != undefined ? PrefixButtonClasses : PrefixStaticContentClasses
    );
  }

  ngOnInit(): void {
    this.buttonComponent?.setButtonType("unstyled");
  }
}
