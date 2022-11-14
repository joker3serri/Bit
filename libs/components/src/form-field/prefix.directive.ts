import { Directive, HostBinding, Input, OnInit } from "@angular/core";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";

export const PrefixClasses = [
  "tw-bg-background-alt",
  "tw-border",
  "tw-border-solid",
  "tw-border-secondary-500",
  "tw-text-muted",
  "tw-rounded-none",
  "hover:tw-bg-secondary-500",
  "hover:tw-text-contrast",
  "disabled:tw-opacity-100",
  "disabled:tw-bg-secondary-100",
  "disabled:hover:tw-bg-secondary-100",
  "disabled:hover:tw-text-muted",
];

@Directive({
  selector: "[bitPrefix]",
})
export class BitPrefixDirective implements OnInit {
  constructor(private buttonComponent: ButtonLikeAbstraction) {}

  @HostBinding("class") @Input() get classList() {
    return PrefixClasses.concat(["tw-border-r-0", "first:tw-rounded-l"]);
  }

  ngOnInit(): void {
    this.buttonComponent.setButtonType(undefined);
  }
}
