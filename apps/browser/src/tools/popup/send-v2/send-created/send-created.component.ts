import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ToastService } from "@bitwarden/components";
import { SendCreatedIcon } from "@bitwarden/send-ui";

import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";
import { PopupHeaderComponent } from "../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../platform/popup/layout/popup-page.component";

@Component({
  selector: "app-send-created",
  templateUrl: "./send-created.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    PopOutComponent,
    PopupHeaderComponent,
    PopupPageComponent,
    RouterLink,
  ],
})
export class SendCreatedComponent {
  protected sendCreatedIcon = SendCreatedIcon;

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {}

  copyLink() {
    const link = this.route.snapshot.queryParamMap.get("link");
    this.platformUtilsService.copyToClipboard(link);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("sendLinkCopied"),
    });
  }
}
