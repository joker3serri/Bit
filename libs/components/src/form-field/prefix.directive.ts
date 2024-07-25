import { Directive, HostBinding, Input, Optional } from "@angular/core";

import { BitIconButtonComponent } from "../icon-button/icon-button.component";

@Directive({
  selector: "[bitPrefix]",
})
export class BitPrefixDirective {
  @HostBinding("class") @Input() get classList() {
    return ["tw-text-muted"];
  }

  @HostBinding("attr.aria-describedby")
  ariaDescribedBy: string;

  constructor(@Optional() private iconButtonComponent: BitIconButtonComponent) {}

  ngOnInit() {
    if (this.iconButtonComponent) {
      this.iconButtonComponent.size = "small";
    }
  }
}
