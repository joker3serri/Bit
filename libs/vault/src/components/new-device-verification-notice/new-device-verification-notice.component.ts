import { Component } from "@angular/core";

import { AnonLayoutComponent } from "@bitwarden/auth/angular";

@Component({
  standalone: true,
  selector: "app-new-device-verification-notice",
  templateUrl: "./new-device-verification-notice.component.html",
  imports: [AnonLayoutComponent],
})
export class NewDeviceVerificationNoticeComponent {
  constructor() {}
}
