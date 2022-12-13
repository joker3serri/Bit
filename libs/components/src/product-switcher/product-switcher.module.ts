import { OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { IconButtonModule } from "../icon-button/icon-button.module";
import { MenuModule } from "../menu";
import { SharedModule } from "../shared/shared.module";

import { ProductSwitcherComponent } from "./product-switcher.component";

@NgModule({
  imports: [CommonModule, MenuModule, SharedModule, IconButtonModule, OverlayModule, RouterModule],
  declarations: [ProductSwitcherComponent],
  exports: [ProductSwitcherComponent],
})
export class ProductSwitcherModule {}
