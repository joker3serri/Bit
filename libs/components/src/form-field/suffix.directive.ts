import { Directive, HostBinding, Input } from "@angular/core";

import { PrefixSuffixClasses } from "./prefix.directive";

@Directive({
  selector: "[bitSuffix]",
})
export class BitSuffixDirective {
  @HostBinding("class") @Input() get classList() {
    return PrefixSuffixClasses.concat(["tw-border-l-0", "last:tw-rounded-r"]);
  }
}
