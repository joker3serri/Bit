import { Component, Input } from "@angular/core";

import { RadioGroupComponent } from "./radio-group.component";

@Component({
  selector: "bit-radio-button",
  templateUrl: "radio-button.component.html",
})
export class RadioButtonComponent {
  @Input() value: unknown;

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
