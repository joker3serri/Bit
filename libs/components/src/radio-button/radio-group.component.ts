import { Component, HostBinding, Input, Optional, Self } from "@angular/core";
import { ControlValueAccessor, NgControl, Validators } from "@angular/forms";

import { BitFormFieldControl } from "../form-field";

let nextId = 0;

@Component({
  selector: "bit-radio-group",
  templateUrl: "radio-group.component.html",
  providers: [{ provide: BitFormFieldControl, useExisting: RadioGroupComponent }],
})
export class RadioGroupComponent implements ControlValueAccessor, BitFormFieldControl {
  selected: unknown;
  disabled = false;

  private _name?: string;
  @Input() get name() {
    return this._name ?? this.ngControl?.name?.toString();
  }
  set name(value: string) {
    this._name = value;
  }

  @HostBinding("attr.role") role = "radiogroup";
  @HostBinding("attr.id") id = `bit-radio-group-${nextId++}`;

  constructor(@Optional() @Self() private ngControl?: NgControl) {
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor
  onChange: (value: unknown) => void;
  onTouched: () => void;

  writeValue(value: boolean): void {
    this.selected = value;
  }

  registerOnChange(fn: (value: unknown) => void): void {
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
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
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

  onInputChange(value: unknown) {
    this.selected = value;
    this.onChange(this.selected);
  }

  onBlur() {
    this.onTouched();
  }
}
