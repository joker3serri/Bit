import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { BitTotpCountdownComponent } from "./totp-countdown.component";

@NgModule({
  imports: [CommonModule],
  declarations: [BitTotpCountdownComponent],
  exports: [BitTotpCountdownComponent],
})
export class TotpCountdownModule {}
