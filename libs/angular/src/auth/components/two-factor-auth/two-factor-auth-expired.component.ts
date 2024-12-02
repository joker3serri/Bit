import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule } from "@bitwarden/components";

/**
 * This component is used to display a message to the user that their authentication session has expired.
 * It provides a button to navigate to the login page.
 */
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

  /**
   * Navigates to the login page.
   */
  async navigateToLogin() {
    await this.router.navigate(["login"]);
  }
}
