import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  NoItemsModule,
  CardComponent,
  SectionHeaderComponent,
  SectionComponent,
  ToastService,
} from "@bitwarden/components";
import { GeneratedCredential } from "@bitwarden/generator-history";

import { NoPasswordsIcon } from "./icons/no-password.icon";

@Component({
  standalone: true,
  selector: "bit-password-generator-history",
  templateUrl: "password-generator-history.component.html",
  imports: [
    NoItemsModule,
    JslibModule,
    CommonModule,
    RouterLink,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
  ],
})
export class PasswordGeneratorHistoryComponent {
  @Input() credentials: GeneratedCredential[];

  noPasswordsIcon = NoPasswordsIcon;

  i18nService: I18nService;

  platformUtilsService: PlatformUtilsService;

  toastService: ToastService;

  constructor(
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    toastService: ToastService,
  ) {
    this.i18nService = i18nService;
    this.platformUtilsService = platformUtilsService;
    this.toastService = toastService;
  }

  async copy(credential: string) {
    if (credential == null) {
      return;
    }

    this.platformUtilsService.copyToClipboard(credential, { window: window });
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("valueCopied", this.i18nService.t("password")),
    });
  }
}
