import { Injectable } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { PopupUtilsService } from "../../../popup/services/popup-utils.service";

@Injectable()
export class FilePopoutUtilsService {
  constructor(
    private platformUtilsService: PlatformUtilsService,
    private popupUtilsService: PopupUtilsService
  ) {}

  showFilePopoutMessage(win: Window): boolean {
    return (
      this.showFirefoxFileWarning(win) ||
      this.showSafariFileWarning(win) ||
      this.showChromiumFileWarning(win)
    );
  }

  showFirefoxFileWarning(win: Window): boolean {
    return (
      this.platformUtilsService.isFirefox() &&
      !(this.popupUtilsService.inSidebar(win) || this.popupUtilsService.inPopout(win))
    );
  }

  showSafariFileWarning(win: Window): boolean {
    return this.platformUtilsService.isSafari() && !this.popupUtilsService.inPopout(win);
  }

  showChromiumFileWarning(win: Window): boolean {
    return (
      (this.isLinux(win) || this.isUnsupportedMac(win)) &&
      !this.platformUtilsService.isFirefox() &&
      !(this.popupUtilsService.inSidebar(win) || this.popupUtilsService.inPopout(win))
    );
  }

  private isLinux(win: Window): boolean {
    return win?.navigator?.userAgent.indexOf("Linux") !== -1;
  }

  private isUnsupportedMac(win: Window): boolean {
    return (
      this.platformUtilsService.isChrome() && win?.navigator?.appVersion.includes("Mac OS X 11")
    );
  }
}
