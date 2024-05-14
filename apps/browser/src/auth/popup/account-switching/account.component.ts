import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { AvatarModule } from "@bitwarden/components";

import { AccountSwitcherService, AvailableAccount } from "./services/account-switcher.service";

@Component({
  standalone: true,
  selector: "auth-account",
  templateUrl: "account.component.html",
  imports: [CommonModule, JslibModule, AvatarModule],
})
export class AccountComponent {
  @Input() account: AvailableAccount;
  @Output() loading = new EventEmitter<boolean>();

  constructor(
    private accountSwitcherService: AccountSwitcherService,
    private i18nService: I18nService,
    private logService: LogService,
  ) {}

  get specialAccountAddId() {
    return this.accountSwitcherService.SPECIAL_ADD_ACCOUNT_ID;
  }

  async selectAccount(id: string) {
    this.loading.emit(true);
    try {
      await this.accountSwitcherService.selectAccount(id);
    } catch (e) {
      this.logService.error("Error selecting account", e);
    }
  }

  get status() {
    if (this.account.isActive) {
      return { text: this.i18nService.t("active"), icon: "bwi-check-circle" };
    }

    if (this.account.status === AuthenticationStatus.Unlocked) {
      return { text: this.i18nService.t("unlocked"), icon: "bwi-unlock" };
    }

    return { text: this.i18nService.t("locked"), icon: "bwi-lock" };
  }
}
