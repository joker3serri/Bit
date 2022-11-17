import { Component, HostBinding, Input } from "@angular/core";

import { Dot } from "./dot.icon";
import { RadioGroupComponent } from "./radio-group.component";

let nextId = 0;

@Component({
  selector: "bit-radio-button",
  templateUrl: "radio-button.component.html",
})
export class RadioButtonComponent {
  id = `bit-radio-button-${nextId++}`;

  @Input() value: unknown;

  protected dot = Dot;

  @HostBinding("class") classes = ["tw-mr-4"];

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

  protected get customRadioClasses() {
    return [
      "tw-transition",
      "tw-inline-block",
      "tw-rounded-full",
      "tw-border",
      "tw-border-solid",
      "tw-bg-background",
      "tw-h-3.5",
      "tw-w-3.5",
      "tw-mr-1.5",

      // Fix radio looking off-center
      "tw-relative",
      "tw-bottom-[-1px]",

      "group-peer-focus-visible:tw-ring-2",
      "group-peer-focus-visible:tw-ring-offset-2",
      "group-peer-focus-visible:tw-ring-primary-700",
    ].concat(
      !this.selected
        ? [
            "tw-border-secondary-500",

            "group-hover:tw-border-2",

            "group-peer-disabled:tw-border",
            "group-peer-disabled:tw-bg-secondary-100",
          ]
        : [
            "tw-border-primary-500",

            "group-hover:tw-border-primary-700",

            "group-peer-disabled:tw-border-secondary-100",
          ]
    );
  }

  protected iconClasses = [
    "tw-absolute",
    "tw-inset-0",
    "tw-flex",
    "tw-justify-center",
    "tw-items-center",
    "tw-stroke-primary-500",
    "tw-fill-primary-500",

    "group-hover:tw-stroke-primary-700",
    "group-hover:tw-fill-primary-700",

    "group-peer-disabled:tw-stroke-text-muted",
    "group-peer-disabled:tw-fill-text-muted",
  ];

  protected labelTextClasses = ["tw-transition", "group-peer-checked:tw-bg-text-main"];

  constructor(private groupComponent: RadioGroupComponent) {}

  get name() {
    return this.groupComponent.name;
  }

  get selected() {
    return this.groupComponent.selected === this.value;
  }

  get disabled() {
    return this.groupComponent.disabled;
  }

  protected onInputChange() {
    this.groupComponent.onInputChange(this.value);
  }

  protected onBlur() {
    this.groupComponent.onBlur();
  }
}
