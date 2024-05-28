import { Component, Input, booleanAttribute } from "@angular/core";

import { Option } from "./option";

@Component({
  selector: "bit-option",
  template: `<ng-template><ng-content></ng-content></ng-template>`,
})
export class OptionComponent<T = unknown> implements Option<T> {
  @Input()
  icon?: string;

  @Input({ required: true })
  value: T;

  @Input({ required: true })
  label: string;

  @Input({ transform: booleanAttribute })
  disabled: boolean;
}
