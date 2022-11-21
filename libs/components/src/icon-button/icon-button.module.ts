import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { BitIconButtonComponent } from "./icon-button.component";
import {
  IconButtonMainDirective,
  IconButtonMutedDirective,
  IconButtonDangerDirective,
  IconButtonPrimaryDirective,
  IconButtonContrastDirective,
  IconButtonSecondaryDirective,
} from "./icon-button-styles.directive";

@NgModule({
  imports: [CommonModule],
  declarations: [
    BitIconButtonComponent,
    IconButtonMainDirective,
    IconButtonMutedDirective,
    IconButtonDangerDirective,
    IconButtonPrimaryDirective,
    IconButtonContrastDirective,
    IconButtonSecondaryDirective,
  ],
  exports: [
    BitIconButtonComponent,
    IconButtonMainDirective,
    IconButtonMutedDirective,
    IconButtonDangerDirective,
    IconButtonPrimaryDirective,
    IconButtonContrastDirective,
    IconButtonSecondaryDirective,
  ],
})
export class IconButtonModule {}
