import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { TypographyModule } from "../typography";

import { BitTotpCountdownComponent } from "./totp-countdown.component";

@NgModule({
  imports: [CommonModule, TypographyModule],
  declarations: [BitTotpCountdownComponent],
  exports: [BitTotpCountdownComponent],
})
export class TotpCountdownModule {}
