import { coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  AfterContentChecked,
  Component,
  ContentChild,
  ContentChildren,
  HostBinding,
  HostListener,
  Input,
  QueryList,
  ViewChild,
  signal,
} from "@angular/core";

import { BitHintComponent } from "../form-control/hint.component";
import { BitLabel } from "../form-control/label.directive";
import { inputBorderClasses } from "../input/input.directive";

import { BitErrorComponent } from "./error.component";
import { BitFormFieldControl } from "./form-field-control";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";

@Component({
  selector: "bit-form-field",
  templateUrl: "./form-field.component.html",
})
export class BitFormFieldComponent implements AfterContentChecked {
  @ContentChild(BitFormFieldControl) input: BitFormFieldControl;
  @ContentChild(BitHintComponent) hint: BitHintComponent;

  @ViewChild(BitErrorComponent) error: BitErrorComponent;

  @ContentChildren(BitPrefixDirective) prefixChildren: QueryList<BitPrefixDirective>;
  @ContentChildren(BitSuffixDirective) suffixChildren: QueryList<BitSuffixDirective>;
  @ContentChildren(BitLabel) labelChildren: QueryList<BitLabel>;

  private _disableMargin = false;
  @Input() set disableMargin(value: boolean | "") {
    this._disableMargin = coerceBooleanProperty(value);
  }
  get disableMargin() {
    return this._disableMargin;
  }

  get labelText() {
    return this.labelChildren?.first?.labelText;
  }

  get inputBorderClasses(): string {
    const shouldFocusBorderAppear = !this.buttonIsFocused();

    const groupClasses = [
      this.input.hasError
        ? "group-hover/input:tw-border-danger-700"
        : "group-hover/input:tw-border-primary-500",
      "group-focus-within/input:tw-outline-none",
      shouldFocusBorderAppear ? "group-focus-within/input:tw-border-2" : "",
      shouldFocusBorderAppear ? "group-focus-within/input:tw-border-primary-500" : "",
      shouldFocusBorderAppear
        ? "group-focus-within/input:group-hover/input:tw-border-primary-500"
        : "",
    ];

    const baseInputBorderClasses = inputBorderClasses(this.input.hasError);

    const borderClasses = baseInputBorderClasses.concat(groupClasses);

    return borderClasses.join(" ");
  }

  @HostBinding("class")
  get classList() {
    return ["tw-block"].concat(this.disableMargin ? [] : ["tw-mb-6"]);
  }

  /**
   * If the currently focused element is a button, then we don't want to show focus on the
   * input field itself.
   *
   * This is necessary because the `tw-group/input` wraps the input and any prefix/suffix
   * buttons
   */
  protected buttonIsFocused = signal(false);
  @HostListener("focusin", ["$event.target"])
  onFocusIn(target: HTMLElement) {
    this.buttonIsFocused.set(target.matches("button"));
  }
  @HostListener("focusout")
  onFocusOut() {
    this.buttonIsFocused.set(false);
  }

  ngAfterContentChecked(): void {
    if (this.error) {
      this.input.ariaDescribedBy = this.error.id;
    } else if (this.hint) {
      this.input.ariaDescribedBy = this.hint.id;
    } else {
      this.input.ariaDescribedBy = undefined;
    }
  }

  /**
   * Determine if all the prefix and suffix buttons are disabled sot hat we can properly show either
   * a partiailly or fully disabled state for the form field
   */
  allButtonsDisabled() {
    const prefixEnabled = this.prefixChildren.filter((prefix) => prefix.isDisabled() === false);
    const suffixEnabled = this.suffixChildren.filter((suffix) => suffix.isDisabled() === false);

    return prefixEnabled.length === 0 && suffixEnabled.length === 0;
  }
}
