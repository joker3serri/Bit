import { Component, ElementRef, HostBinding, Input, OnInit } from "@angular/core";

import { TotpService } from "@bitwarden/common/vault/abstractions/totp.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { ButtonType } from "../shared/button-like.abstraction";


export type IconButtonType = ButtonType | "contrast" | "main" | "muted" | "light";

export type IconButtonSize = "default" | "small";

const sizes: Record<IconButtonSize, string[]> = {
  default: ["tw-px-1", "tw-py-1.5"],
  small: ["tw-leading-none", "tw-text-base", "tw-p-1"],
};

@Component({
  selector: "button[bitTotpCountdown]:not(button[bitButton])",
  templateUrl: "totp-countdown.component.html",
})
export class BitTotpCountdownComponent implements OnInit {
  @Input() cipher: CipherView;

  @Input() buttonType: IconButtonType;

  @Input() size: IconButtonSize = "default";

  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-border",
      "tw-border-solid",
      "tw-rounded",
      "tw-transition",
      "hover:tw-no-underline",
      "focus:tw-outline-none",
    ].concat(sizes[this.size]);
  }

  totpCode: string;
  // how to get code formatted up to the login-credentials-view component for use in the input and copy
  totpCodeFormatted: string;
  totpDash: number;
  totpSec: number;
  totpLow: boolean;
  private totpInterval: any;

  @Input() loading = false;
  @Input() disabled = false;

  setButtonType(value: "primary" | "secondary" | "danger" | "unstyled") {
    this.buttonType = value;
  }

  getFocusTarget() {
    return this.elementRef.nativeElement;
  }

  constructor(
    protected totpService: TotpService,
    private elementRef: ElementRef,
  ) {}

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
      } else {
        this.totpCodeFormatted = this.totpCode;
      }
    } else {
      this.totpCodeFormatted = null;
      if (this.totpInterval) {
        clearInterval(this.totpInterval);
      }
    }
  }

  private async totpTick(intervalSeconds: number) {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const mod = epoch % intervalSeconds;

    this.totpSec = intervalSeconds - mod;
    this.totpDash = +(Math.round(((78.6 / intervalSeconds) * mod + "e+2") as any) + "e-2");
    this.totpLow = this.totpSec <= 7;
    if (mod === 0) {
      await this.totpUpdateCode();
    }
  }
}
