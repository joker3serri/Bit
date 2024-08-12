import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { TotpService } from "@bitwarden/common/vault/abstractions/totp.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

@Component({
  selector: "button[bitTotpCountdown]:not(button[bitButton])",
  templateUrl: "totp-countdown.component.html",
})
export class BitTotpCountdownComponent implements OnInit {
  @Input() cipher: CipherView;
  @Output() sendCopyCode = new EventEmitter();

  totpCode: string;
  totpCodeFormatted: string;
  totpDash: number;
  totpSec: number;
  totpLow: boolean;
  private totpInterval: any;

  constructor(protected totpService: TotpService) {}

  async ngOnInit() {
    await this.totpUpdateCode();
    const interval = this.totpService.getTimeInterval(this.cipher.login.totp);
    await this.totpTick(interval);

    this.totpInterval = setInterval(async () => {
      await this.totpTick(interval);
    }, 1000);
  }

  private async totpUpdateCode() {
    if (
      this.cipher == null ||
      this.cipher.type !== CipherType.Login ||
      this.cipher.login.totp == null
    ) {
      if (this.totpInterval) {
        clearInterval(this.totpInterval);
      }
      return;
    }

    this.totpCode = await this.totpService.getCode(this.cipher.login.totp);
    if (this.totpCode != null) {
      if (this.totpCode.length > 4) {
        const half = Math.floor(this.totpCode.length / 2);
        this.totpCodeFormatted =
          this.totpCode.substring(0, half) + " " + this.totpCode.substring(half);
        this.sendCopyCode.emit(this.totpCodeFormatted);
      } else {
        this.totpCodeFormatted = this.totpCode;
      }
    } else {
      this.totpCodeFormatted = null;
      this.sendCopyCode.emit(this.totpCodeFormatted);
      if (this.totpInterval) {
        clearInterval(this.totpInterval);
      }
    }
  }

  private async totpTick(intervalSeconds: number) {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const mod = epoch % intervalSeconds;

    this.totpSec = intervalSeconds - mod;
    this.totpDash = +(Math.round(((60 / intervalSeconds) * mod + "e+2") as any) + "e-2");
    this.totpLow = this.totpSec <= 7;
    if (mod === 0) {
      await this.totpUpdateCode();
    }
  }
}
