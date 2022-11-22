import { Component, Input, Optional, Self } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

import { BitFormFieldControl } from "../form-field/form-field-control";

let nextId = 0;

@Component({
  selector: "bit-checkbox-control",
  templateUrl: "checkbox-control.component.html",
  providers: [{ provide: BitFormFieldControl, useExisting: CheckboxControlComponent }],
})
export class CheckboxControlComponent implements ControlValueAccessor {
  id = `bit-checkbox-${nextId++}`;

  private _name?: string;
  @Input() get name() {
    return this._name ?? this.ngControl?.name?.toString();
  }
  set name(value: string) {
    this._name = value;
  }

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
