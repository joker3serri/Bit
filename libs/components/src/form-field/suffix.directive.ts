import { Directive, HostBinding, Input, Optional } from "@angular/core";

import { BitIconButtonComponent } from "../icon-button/icon-button.component";

import { BitFormFieldComponent } from "./form-field.component";

@Directive({
  selector: "[bitSuffix]",
})
export class BitSuffixDirective {
  @HostBinding("class") @Input() get classList() {
    return ["tw-text-muted"];
  }

  private _ariaDescribedBy: string = null;
  @HostBinding("attr.aria-describedby")
  set ariaDescribedBy(value: string) {
    this._ariaDescribedBy = value;
  }
  get ariaDescribedBy() {
    return this._ariaDescribedBy;
  }

  constructor(
    @Optional() private parentFormField: BitFormFieldComponent,
    @Optional() private iconButtonComponent: BitIconButtonComponent,
  ) {}

  ngOnInit() {
    if (this.iconButtonComponent) {
      this.iconButtonComponent.size = "small";
    }
  }

  ngAfterContentInit() {
    if (this.parentFormField?.label?.id) {
      this.ariaDescribedBy = this.parentFormField.label.id;
    }
  }
}
