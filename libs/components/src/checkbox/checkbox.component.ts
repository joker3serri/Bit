import { Component, HostBinding, Input, Optional, Self } from "@angular/core";
import { NgControl, Validators } from "@angular/forms";

import { BitFormFieldControl } from "../form-field/form-field-control";

let nextId = 0;

@Component({
  selector: "bit-checkbox",
  templateUrl: "checkbox.component.html",
  providers: [[{ provide: BitFormFieldControl, useExisting: CheckboxComponent }]],
})
export class CheckboxComponent implements BitFormFieldControl {
  id = `bit-checkbox-${nextId++}`;

  // protected inputClasses = ["tw-peer", "tw-appearance-none", "tw-outline-none"];
  protected inputClasses = [];
  protected labelClasses = [];

  protected checked: boolean;
  protected disabled = false;

  constructor(@Optional() @Self() private ngControl?: NgControl) {
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor
  onChange: (value: boolean) => void;
  onTouched: () => void;

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // BitFormFieldControl
  @HostBinding("attr.aria-describedby")
  ariaDescribedBy: string;

  get labelForId() {
    return this.id;
  }

  @Input()
  get required() {
    return (
      this._required ?? this.ngControl?.control?.hasValidator(Validators.requiredTrue) ?? false
    );
  }
  set required(value: any) {
    this._required = value != null && value !== false;
  }
  private _required: boolean;

  @Input() hasPrefix = false;
  @Input() hasSuffix = false;

  get hasError() {
    return this.ngControl?.status === "INVALID" && this.ngControl?.touched;
  }

  get error(): [string, any] {
    const key = Object.keys(this.ngControl.errors)[0];
    return [key, this.ngControl.errors[key]];
  }

  protected onInputChange(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    this.checked = event.target.checked;
    this.onChange(this.checked);
  }

  protected onBlur() {
    this.onTouched();
  }
}
