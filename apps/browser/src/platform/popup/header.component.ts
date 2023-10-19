import { Component } from "@angular/core";
import { Observable, map } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import { devFlagEnabled } from "../flags";

@Component({
  selector: "app-header",
  templateUrl: "header.component.html",
})
export class HeaderComponent {
  authedAccounts$: Observable<boolean>;
  constructor(accountService: AccountService) {
    this.authedAccounts$ = accountService.accounts$.pipe(
      map((accounts) => {
        if (!devFlagEnabled("accountSwitching")) {
          return false;
        }

        return Object.values(accounts).some((a) => a.status !== AuthenticationStatus.LoggedOut);
      })
    );
  }
}
