import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule } from "@bitwarden/components";

@Component({
  selector: "app-two-factor-expired",
  standalone: true,
  imports: [CommonModule, JslibModule, ButtonModule],
  template: `
    <p class="tw-text-center">
      {{ "authenticationSessionTimedOut" | i18n }}
    </p>
    <button bitButton block (click)="navigateToLogin()" buttonType="primary">
      {{ "logIn" | i18n }}
    </button>
  `,
})
export class TwoFactorTimeoutComponent {
  constructor(private router: Router) {}

  async navigateToLogin() {
    await this.router.navigate(["login"]);
  }
}
