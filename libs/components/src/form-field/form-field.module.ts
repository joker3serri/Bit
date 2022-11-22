import { NgModule } from "@angular/core";

import { FormControlModule } from "../form-control";
import { BitInputDirective } from "../input/input.directive";
import { InputModule } from "../input/input.module";
import { MultiSelectComponent } from "../multi-select/multi-select.component";
import { MultiSelectModule } from "../multi-select/multi-select.module";
import { SharedModule } from "../shared";

import { BitErrorSummary } from "./error-summary.component";
import { BitErrorComponent } from "./error.component";
import { BitFormFieldComponent } from "./form-field.component";
import { BitHintComponent } from "./hint.component";
import { BitPrefixDirective } from "./prefix.directive";
import { BitSuffixDirective } from "./suffix.directive";

@NgModule({
  imports: [SharedModule, FormControlModule, InputModule, MultiSelectModule],
  exports: [
    FormControlModule,
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitPrefixDirective,
    BitSuffixDirective,
    BitInputDirective,
    MultiSelectComponent,
  ],
  declarations: [
    BitErrorComponent,
    BitErrorSummary,
    BitFormFieldComponent,
    BitHintComponent,
    BitPrefixDirective,
    BitSuffixDirective,
  ],
})
export class FormFieldModule {}
