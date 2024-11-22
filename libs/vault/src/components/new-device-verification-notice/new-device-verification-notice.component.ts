import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { TypographyModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-new-device-verification-notice",
  templateUrl: "./new-device-verification-notice.component.html",
  imports: [CommonModule, JslibModule, TypographyModule],
})
export class NewDeviceVerificationNoticeComponent implements OnInit {
  formMessage: string;
  constructor(private i18nService: I18nService) {}

  ngOnInit() {
    this.formMessage = this.i18nService.t(
      "newDeviceVerificationNoticePage1FormContent",
      "peter.parker@daily.com",
    );
  }
  submit = () => {};
}
