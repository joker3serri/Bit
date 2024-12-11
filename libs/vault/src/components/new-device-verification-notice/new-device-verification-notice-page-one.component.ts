import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { ClientType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { UserId } from "@bitwarden/common/types/guid";
import {
  AsyncActionsModule,
  ButtonModule,
  CardComponent,
  FormFieldModule,
  RadioButtonModule,
  TypographyModule,
} from "@bitwarden/components";

import { NewDeviceVerificationNoticeService } from "./../../services/new-device-verification-notice.service";

@Component({
  standalone: true,
  selector: "app-new-device-verification-notice-page-one",
  templateUrl: "./new-device-verification-notice-page-one.component.html",
  imports: [
    CardComponent,
    CommonModule,
    JslibModule,
    TypographyModule,
    ButtonModule,
    RadioButtonModule,
    FormFieldModule,
    AsyncActionsModule,
    ReactiveFormsModule,
  ],
})
export class NewDeviceVerificationNoticePageOneComponent implements OnInit {
  formMessage: string;
  protected formGroup = this.formBuilder.group({
    hasEmailAccess: new FormControl(0),
  });
  protected isDesktop: boolean;
  readonly currentAcct$ = this.accountService.activeAccount$.pipe(map((acct) => acct));
  private currentEmail: string;
  private currentUserId: UserId;

  constructor(
    private i18nService: I18nService,
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private newDeviceVerificationNoticeService: NewDeviceVerificationNoticeService,
    private platformUtilsService: PlatformUtilsService,
  ) {
    this.isDesktop = this.platformUtilsService.getClientType() === ClientType.Desktop;
  }

  async ngOnInit() {
    this.currentEmail = (await firstValueFrom(this.currentAcct$)).email;
    this.currentUserId = (await firstValueFrom(this.currentAcct$)).id;
    this.formMessage = this.i18nService.t(
      "newDeviceVerificationNoticePageOneFormContent",
      this.currentEmail,
    );
  }

  submit = async () => {
    if (this.formGroup.controls.hasEmailAccess.value === 0) {
      await this.router.navigate(["new-device-notice/setup"]);
    } else if (this.formGroup.controls.hasEmailAccess.value === 1) {
      await this.newDeviceVerificationNoticeService.updateNewDeviceVerificationNoticeState(
        this.currentUserId,
        {
          last_dismissal: new Date(),
          permanent_dismissal: null,
        },
      );

      await this.router.navigate(["/vault"]);
    }
  };
}
