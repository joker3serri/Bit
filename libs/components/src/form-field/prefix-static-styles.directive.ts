import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
  selector: "span[bitPrefix]",
})
export class BitPrefixSuffixSpanDirective {
  @HostBinding("class") @Input() get classList() {
    return ["tw-block", "tw-px-3", "tw-py-1.5"];
  }
}
