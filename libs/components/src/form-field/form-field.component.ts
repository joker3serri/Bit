import {
  AfterContentChecked,
  Component,
  ContentChild,
  ContentChildren,
  QueryList,
  ViewChild,
} from "@angular/core";
import { BitInputDirective } from "../input/input.directive";

import { BitErrorComponent } from "./error.component";
import { BitFormFieldControl } from "./form-field-control";
import { BitHintComponent } from "./hint.component";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";

@Component({
  selector: "bit-form-field",
  templateUrl: "./form-field.component.html",
  host: {
    class: "tw-mb-6 tw-block",
  },
})
export class BitFormFieldComponent implements AfterContentChecked {
  //TODO FIX: @ContentChild(BitFormFieldControl) input: BitFormFieldControl<any>;
  @ContentChild(BitInputDirective) input: BitInputDirective;
  @ContentChild(BitHintComponent) hint: BitHintComponent;

  @ViewChild(BitErrorComponent) error: BitErrorComponent;

  @ContentChildren(BitPrefixDirective) prefixChildren: QueryList<BitPrefixDirective>;
  @ContentChildren(BitSuffixDirective) suffixChildren: QueryList<BitSuffixDirective>;

  ngAfterContentChecked(): void {
    if (this.error) {
      this.input.ariaDescribedBy = this.error.id;
    } else if (this.hint) {
      this.input.ariaDescribedBy = this.hint.id;
    } else {
      this.input.ariaDescribedBy = undefined;
    }
  }
}
