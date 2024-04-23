import { AfterContentChecked, ContentChild, Directive, HostBinding } from "@angular/core";

import { FocusableElement } from "../shared/focusable-element";

@Directive({
  selector: "bitA11yCell",
  standalone: true,
})
export class A11yCellDirective implements AfterContentChecked {
  @HostBinding("attr.role")
  role = "gridcell";

  @ContentChild(FocusableElement)
  focusableChild: FocusableElement;

  ngAfterContentChecked(): void {
    if (!this.focusableChild) {
      // eslint-disable-next-line no-console
      console.error("A11yCellDirective must contain content that provides FocusableElement");
      return;
    }
    this.focusableChild.getFocusTarget().tabIndex = -1;
  }
}
