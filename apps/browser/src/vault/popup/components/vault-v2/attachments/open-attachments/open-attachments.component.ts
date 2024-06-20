import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CardComponent, TypographyModule } from "@bitwarden/components";

import BrowserPopupUtils from "../../../../../../platform/popup/browser-popup-utils";

@Component({
  standalone: true,
  selector: "app-open-attachments",
  templateUrl: "./open-attachments.component.html",
  imports: [CommonModule, JslibModule, TypographyModule, CardComponent],
})
export class OpenAttachmentsComponent {
  /** Cipher `id` */
  @Input({ required: true }) cipherId: string;

  /** True when the attachments window should be opened in a popout */
  openAttachmentsInPopout = BrowserPopupUtils.inPopup(window);

  constructor(private router: Router) {}

  /** Routes the user to the attachments screen */
  async openAttachments() {
    if (this.openAttachmentsInPopout) {
      const destinationUrl = this.router
        .createUrlTree(["/attachments"], { queryParams: { cipherId: this.cipherId } })
        .toString();

      const currentBaseUrl = window.location.href.replace(this.router.url, "");

      await BrowserPopupUtils.openCurrentPagePopout(window, currentBaseUrl + destinationUrl);
    } else {
      await this.router.navigate(["/attachments"], { queryParams: { cipherId: this.cipherId } });
    }
  }
}
