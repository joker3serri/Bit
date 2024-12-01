import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { ButtonModule } from "@bitwarden/components";

@Component({
  selector: "app-two-factor-expired",
  standalone: true,
  imports: [CommonModule, JslibModule, ButtonModule],
  providers: [I18nPipe],
  template: `
    <p class="tw-text-center">
      {{ "authenticationSessionTimedOut" | i18n }}
    </p>
    <button bitButton block (click)="logIn()" buttonType="primary">
      {{ "logIn" | i18n }}
    </button>
  `,
})
export class twoFactorTimeoutComponent {
  constructor(private router: Router) {}

  async logIn() {
    await this.router.navigate(["login"]);
  }
}
