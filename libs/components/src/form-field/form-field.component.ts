import {
  AfterContentChecked,
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  EnvironmentInjector,
  HostBinding,
  HostListener,
  Input,
  QueryList,
  ViewChild,
  booleanAttribute,
  inject,
  runInInjectionContext,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";

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
export class BitFormFieldComponent implements AfterContentChecked, AfterContentInit {
  @ContentChild(BitFormFieldControl) input: BitFormFieldControl;
  @ContentChild(BitHintComponent) hint: BitHintComponent;
  @ContentChild(BitLabel) label: BitLabel;

  @ContentChildren(BitPrefixDirective) prefixChildren: QueryList<BitPrefixDirective>;
  @ContentChildren(BitSuffixDirective) suffixChildren: QueryList<BitPrefixDirective>;

  @ViewChild(BitErrorComponent) error: BitErrorComponent;

  private environmentInjector = inject(EnvironmentInjector);

  @Input({ transform: booleanAttribute })
  disableMargin = false;

  /** If `true`, remove the bottom border for `readonly` inputs */
  @Input({ transform: booleanAttribute })
  disableReadOnlyBorder = false;

  protected inputWrapperClasses: string;

  protected prefixHasChildren = signal(false);
  protected suffixHasChildren = signal(false);

  get inputBorderClasses(): string {
    const shouldFocusBorderAppear = this.defaultContentIsFocused();

    const groupClasses = [
      this.input.hasError
        ? "group-hover/bit-form-field:tw-border-danger-700"
        : "group-hover/bit-form-field:tw-border-primary-500",
      "group-focus-within/bit-form-field:tw-outline-none",
      shouldFocusBorderAppear ? "group-focus-within/bit-form-field:tw-border-2" : "",
      shouldFocusBorderAppear ? "group-focus-within/bit-form-field:tw-border-primary-500" : "",
      shouldFocusBorderAppear
        ? "group-focus-within/bit-form-field:group-hover/bit-form-field:tw-border-primary-500"
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
   * If the currently focused element is not part of the default content, then we don't want to show focus on the
   * input field itself.
   *
   * This is necessary because the `tw-group/bit-form-field` wraps the input and any prefix/suffix
   * buttons
   */
  protected defaultContentIsFocused = signal(false);
  @HostListener("focusin", ["$event.target"])
  onFocusIn(target: HTMLElement) {
    this.defaultContentIsFocused.set(target.matches(".default-content *:focus-visible"));
  }
  @HostListener("focusout")
  onFocusOut() {
    this.defaultContentIsFocused.set(false);
  }

  protected get readOnly(): boolean {
    return this.input.readOnly;
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

  ngAfterContentInit() {
    if (this.label) {
      this.prefixChildren.forEach((prefixChild) => {
        prefixChild.ariaDescribedBy = this.label.id;
      });

      this.suffixChildren.forEach((suffixChild) => {
        suffixChild.ariaDescribedBy = this.label.id;
      });
    }

    runInInjectionContext(this.environmentInjector, () => {
      if (this.prefixChildren) {
        this.prefixChildren.changes
          .pipe(startWith(this.prefixChildren), takeUntilDestroyed())
          .subscribe(() => {
            this.prefixHasChildren.set(this.prefixChildren.length > 0);
          });
      }

      if (this.suffixChildren) {
        this.suffixChildren.changes
          .pipe(startWith(this.suffixChildren), takeUntilDestroyed())
          .subscribe(() => {
            this.suffixHasChildren.set(this.suffixChildren.length > 0);
          });
      }
    });
  }
}
