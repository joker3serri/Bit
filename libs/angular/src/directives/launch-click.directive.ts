import { Directive, HostListener, Input } from "@angular/core";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Directive({
  selector: "[appLaunchClick]",
})
export class LaunchClickDirective {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  @Input("appLaunchClick") uriToLaunch = "";

  @HostListener("click") onClick() {
    if (this.uriToLaunch) {
      this.platformUtilsService.launchUri(this.uriToLaunch);
    }
  }
}
