import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, map, Observable } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { Account, AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { ClientType } from "@bitwarden/common/enums";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
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
  protected isDesktop: boolean;
  readonly currentAcct$: Observable<Account | null> = this.accountService.activeAccount$.pipe(
    map((acct) => acct),
  );
  private currentUserId: UserId | null = null;

  constructor(
    private newDeviceVerificationNoticeService: NewDeviceVerificationNoticeService,
    private router: Router,
    private accountService: AccountService,
    private platformUtilsService: PlatformUtilsService,
  ) {
    this.isDesktop = this.platformUtilsService.getClientType() === ClientType.Desktop;
  }

  async ngOnInit() {
    this.currentUserId = (await firstValueFrom(this.currentAcct$)).id;
  }
  async remindMeLaterSelect() {
    await this.newDeviceVerificationNoticeService.updateNewDeviceVerificationNoticeState(
      this.currentUserId,
      {
        last_dismissal: new Date(),
        permanent_dismissal: false,
      },
    );

    await this.router.navigate(["/vault"]);
  }
}
