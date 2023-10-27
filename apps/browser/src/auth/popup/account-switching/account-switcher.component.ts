import { Component } from "@angular/core";

import { AccountSwitcherService } from "../services/account-switching.service";

@Component({
  templateUrl: "account-switcher.component.html",
})
export class AccountSwitcherComponent {
  constructor(private accountSwitcherService: AccountSwitcherService) {}

  get accountOptions$() {
    return this.accountSwitcherService.accountOptions$;
  }

  async selectAccount(id: string) {
    await this.accountSwitcherService.selectAccount(id);
  }
}
