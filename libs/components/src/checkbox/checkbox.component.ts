import { Component, HostBinding, Input, Optional, Self } from "@angular/core";
import { NgControl, Validators } from "@angular/forms";

import { BitFormFieldControl } from "../form-field/form-field-control";

import { Checkmark } from "./checkmark.icon";

let nextId = 0;

@Component({
  selector: "bit-checkbox",
  templateUrl: "checkbox.component.html",
  providers: [[{ provide: BitFormFieldControl, useExisting: CheckboxComponent }]],
})
export class CheckboxComponent implements BitFormFieldControl {
  id = `bit-checkbox-${nextId++}`;

  protected checkmark = Checkmark;

  protected inputClasses = ["tw-peer", "tw-appearance-none", "tw-outline-none"];

  protected labelClasses = [
    "tw-group",
    "tw-transition",
    "tw-cursor-pointer",
    "tw-select-none",
    "tw-mb-0",

    "peer-disabled:tw-cursor-auto",
  ];

  protected labelContentClasses = [
    "tw-font-semibold",
    "tw-text-main",

    "group-peer-disabled:tw-text-muted",
  ];

  protected get customCheckboxClasses() {
    return [
      "tw-transition",
      "tw-inline-block",
      "tw-rounded",
      "tw-border",
      "tw-border-solid",
      "tw-h-3.5",
      "tw-w-3.5",
      "tw-mr-1.5",

      // Fix checkbox looking off-center
      "tw-relative",
      "tw-bottom-[-1px]",

      "group-hover:tw-border-2",

      "group-peer-focus-visible:tw-ring-2",
      "group-peer-focus-visible:tw-ring-offset-2",
      "group-peer-focus-visible:tw-ring-primary-700",
    ].concat(
      !this.checked
        ? [
            "tw-bg-background",
            "tw-border-secondary-500",

            "group-peer-disabled:tw-border",
            "group-peer-disabled:tw-bg-secondary-100",
          ]
        : [
            "tw-bg-primary-500",
            "tw-border-primary-500",

            "group-hover:tw-bg-primary-700",
            "group-hover:tw-border-primary-700",

            "group-peer-disabled:tw-border-secondary-100",
            "group-peer-disabled:tw-bg-secondary-100",
          ]
    );
  }

  protected iconClasses = [
    "tw-absolute",
    "tw-inset-0",
    "tw-flex",
    "tw-justify-center",
    "tw-items-center",
    "tw-stroke-text-contrast",

    "group-peer-disabled:tw-stroke-text-muted",
  ];

  protected labelTextClasses = ["tw-transition", "group-peer-checked:tw-bg-text-main"];

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
