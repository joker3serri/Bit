import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { AuthRequestServiceAbstraction } from "@bitwarden/auth/common";

@Component({
  standalone: true,
  templateUrl: "./login-via-auth-request.component.html",
  imports: [],
})
export class LoginViaAuthRequestComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private authRequestService: AuthRequestServiceAbstraction) {
    this.authRequestService.authRequestPushNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        // code...
      });
  }

  async ngOnInit(): Promise<void> {
    // code...
  }

  async ngOnDestroy(): Promise<void> {
    // await this.anonymousHubService.stopHubConnection();

    this.destroy$.next();
    this.destroy$.complete();
  }
}
