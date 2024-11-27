import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import {
  AsyncActionsModule,
  ButtonModule,
  FormFieldModule,
  RadioButtonModule,
  TypographyModule,
} from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-new-device-verification-notice-page-one",
  templateUrl: "./new-device-verification-notice-page-one.component.html",
  imports: [
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
  readonly currentAcct$ = this.accountService.activeAccount$.pipe(map((acct) => acct?.email));

  constructor(
    private i18nService: I18nService,
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountService,
  ) {}

  async ngOnInit() {
    const currentEmail = await firstValueFrom(this.currentAcct$);
    this.formMessage = this.i18nService.t(
      "newDeviceVerificationNoticePageOneFormContent",
      currentEmail,
    );
  }

  submit = () => {
    if (this.formGroup.controls.hasEmailAccess.value === 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["blah/setup"]);
    } else if (this.formGroup.controls.hasEmailAccess.value === 1) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/vault"]);
    }
  };
}
