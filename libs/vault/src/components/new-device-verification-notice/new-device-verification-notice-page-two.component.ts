import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { UserId } from "@bitwarden/common/types/guid";
import { ButtonModule, LinkModule, TypographyModule } from "@bitwarden/components";

import { NewDeviceVerificationNoticeService } from "../../services/new-device-verification-notice.service";

@Component({
  standalone: true,
  selector: "app-new-device-verification-notice-page-two",
  templateUrl: "./new-device-verification-notice-page-two.component.html",
  imports: [CommonModule, JslibModule, TypographyModule, ButtonModule, LinkModule],
})
export class NewDeviceVerificationNoticePageTwoComponent implements OnInit {
  formMessage: string;
  readonly currentAcct$ = this.accountService.activeAccount$.pipe(map((acct) => acct));
  private currentUserId: UserId;

  constructor(
    private i18nService: I18nService,
    private newDeviceVerificationNoticeService: NewDeviceVerificationNoticeService,
    private router: Router,
    private accountService: AccountService,
  ) {}

  async ngOnInit() {
    this.currentUserId = (await firstValueFrom(this.currentAcct$)).id;
    this.formMessage = this.i18nService.t(
      "newDeviceVerificationNoticePageOneFormContent",
      "peter.parker@daily.com",
    );
  }
  async remindMeLaterSelect() {
    await this.newDeviceVerificationNoticeService.updateNewDeviceVerificationNoticeState(
      this.currentUserId,
      {
        last_dismissal: new Date(),
        permanent_dismissal: null,
      },
    );

    await this.router.navigate(["/vault"]);
  }
}
