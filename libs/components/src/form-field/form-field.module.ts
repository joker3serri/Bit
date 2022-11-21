import { NgModule } from "@angular/core";

import { BitInputDirective } from "../input/input.directive";
import { InputModule } from "../input/input.module";
import { MultiSelectComponent } from "../multi-select/multi-select.component";
import { MultiSelectModule } from "../multi-select/multi-select.module";
import { SharedModule } from "../shared";

import { BitErrorSummary } from "./error-summary.component";
import { BitErrorComponent } from "./error.component";
import { BitFormFieldComponent } from "./form-field.component";
import { BitHintComponent } from "./hint.component";
import { BitLabel } from "./label.directive";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";
import {
  BitPrefixSuffixButtonDirective,
  BitPrefixSuffixIconButtonDirective,
} from "./prefix-suffix-button.directive";

@NgModule({
  imports: [SharedModule, InputModule, MultiSelectModule],
  exports: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitLabel,
    BitPrefixDirective,
    BitSuffixDirective,
    BitInputDirective,
    MultiSelectComponent,
    BitPrefixSuffixButtonDirective,
    BitPrefixSuffixIconButtonDirective,
  ],
  declarations: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitLabel,
    BitPrefixDirective,
    BitSuffixDirective,
    BitPrefixSuffixButtonDirective,
    BitPrefixSuffixIconButtonDirective,
  ],
})
export class FormFieldModule {}
