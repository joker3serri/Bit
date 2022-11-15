import { Component } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

let nextId = 0;

@Component({
  selector: "bit-checkbox",
  templateUrl: "checkbox.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxComponent,
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  protected id = nextId++;
  // protected inputClasses = ["tw-peer", "tw-appearance-none", "tw-outline-none"];
  protected inputClasses = [];
  protected labelClasses = [];

  protected checked: boolean;
  protected disabled = false;

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
