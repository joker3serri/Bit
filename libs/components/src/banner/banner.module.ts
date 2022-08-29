import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IconButtonModule } from "../icon-button";

import { BannerComponent } from "./banner.component";

@NgModule({
  imports: [CommonModule, IconButtonModule],
  exports: [BannerComponent],
  declarations: [BannerComponent],
})
export class BannerModule {}
