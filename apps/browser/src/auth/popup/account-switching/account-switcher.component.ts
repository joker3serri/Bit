import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { combineLatest, map } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { UserId } from "@bitwarden/common/types/guid";

@Component({
  templateUrl: "account-switcher.component.html",
})
export class AccountSwitcherComponent {
  constructor(
    private accountService: AccountService,
    private stateService: StateService,
    private router: Router,
    private messagingService: MessagingService
  ) {}

  get accountOptions$() {
    return combineLatest([this.accountService.accounts$, this.accountService.activeAccount$]).pipe(
      map(([accounts, activeAccount]) => {
        const accountEntries = Object.entries(accounts);
        // Accounts shouldn't ever be more than 5 but just in case do a greater than
        const hasMaxAccounts = accountEntries.length >= 5;
        const options: { name: string; id: string; isSelected: boolean }[] = accountEntries.map(
          ([id, account]) => {
            return {
              name: account.name ?? account.email,
              id: id,
              isSelected: id === activeAccount?.id,
            };
          }
        );

        if (!hasMaxAccounts) {
          options.push({
            name: "Add Account",
            id: "addAccount",
            isSelected: activeAccount?.id == null,
          });
        }

        return options;
      })
    );
  }

  async selectAccount(id: string) {
    if (id === "addAccount") {
      await this.stateService.setActiveUser(null);
      await this.stateService.setRememberedEmail(null);
      this.router.navigate(["/home"]);
      return;
    }

    this.accountService.switchAccount(id as UserId);
    this.messagingService.send("switchAccount", { userId: id });
    this.router.navigate(["/home"]);
  }
}
