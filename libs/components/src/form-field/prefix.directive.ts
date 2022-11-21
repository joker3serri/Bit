import { Directive, HostBinding, Input, Optional } from "@angular/core";

export const PrefixSuffixClasses = [
  "tw-bg-background-alt",
  "tw-border",
  "tw-border-solid",
  "tw-border-secondary-500",
  "tw-text-muted",
  "tw-rounded-none",
];

@Directive({
  selector: "[bitPrefix]",
})
export class BitPrefixDirective {
  @HostBinding("class") @Input() get classList() {
    return PrefixSuffixClasses.concat(["tw-border-r-0", "first:tw-rounded-l"]);
  }
}
