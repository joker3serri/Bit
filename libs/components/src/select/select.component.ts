import {
  Component,
  ContentChildren,
  HostBinding,
  Input,
  Optional,
  QueryList,
  Self,
} from "@angular/core";
import { NgControl } from "@angular/forms";

import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";

import { Option } from "./option";
import { OptionComponent } from "./option.component";

@Component({
  selector: "bit-select",
  templateUrl: "select.component.html",
})
export class SelectComponent<T> {
  @Input()
  /** Optional: Options can be provided using an array input or using `bit-option` */
  items: Option<T>[] = [];

  @Input()
  placeholder = this.i18nService.t("selectPlaceholder");

  protected value: T;

  constructor(
    private i18nService: I18nService,
    @Optional() @Self() private ngControl?: NgControl
  ) {}

  @ContentChildren(OptionComponent)
  protected set breadcrumbList(value: QueryList<OptionComponent<T>>) {
    this.items = value.toArray();
  }

  @HostBinding()
  @Input()
  get disabled() {
    return this._disabled ?? this.ngControl?.disabled ?? false;
  }
  set disabled(value: any) {
    this._disabled = value != null && value !== false;
  }
  private _disabled: boolean;
}
