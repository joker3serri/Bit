import { Directive, ElementRef, HostBinding, Input, Optional } from "@angular/core";

import { FormControlComponent } from "./form-control.component";

// Increments for each instance of this component
let nextId = 0;

@Directive({
  selector: "bit-label",
})
export class BitLabel {
  constructor(
    private elementRef: ElementRef<HTMLInputElement>,
    @Optional() private parentFormControl: FormControlComponent,
  ) {}

  @HostBinding("class") @Input() get classList() {
    /**
     * We don't want to truncate checkboxes or radio buttons, which use form-control
     */
    return this.parentFormControl ? [] : ["tw-truncate"];
  }

  @HostBinding("title") get title() {
    return this.elementRef.nativeElement.textContent;
  }

  @HostBinding() @Input() id = `bit-label-${nextId++}`;
}
