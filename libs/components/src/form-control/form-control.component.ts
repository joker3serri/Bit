import { Component, ContentChild, HostBinding, Input } from "@angular/core";

import { BitFormControlAbstraction } from "./form-control.abstraction";

@Component({
  selector: "bit-form-control",
  templateUrl: "form-control.component.html",
})
export class FormControlComponent {
  @Input() label: string;

  @ContentChild(BitFormControlAbstraction) private formControl: BitFormControlAbstraction;

  @HostBinding("class") classes = ["tw-block", "tw-mb-6"];

  protected get labelClasses() {
    return ["tw-transition", "tw-select-none", "tw-mb-0"].concat(
      this.formControl.disabled ? "tw-cursor-auto" : "tw-cursor-pointer"
    );
  }

  protected get labelContentClasses() {
    return ["tw-font-semibold"].concat(
      this.formControl.disabled ? "tw-text-muted" : "tw-text-main"
    );
  }

  get required() {
    return this.formControl.required;
  }
}
