import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  RegistrationEnvSelectorComponent,
  RegistrationStartComponent,
  RegistrationStartState,
} from "@bitwarden/auth/angular";
import { DialogService } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "auth-registration-page",
  templateUrl: "registration-start.page.html",
  imports: [
    CommonModule,
    JslibModule,
    RegistrationStartComponent,
    RegistrationEnvSelectorComponent,
  ],
})
export class RegistrationPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  RegistrationStartState = RegistrationStartState;
  registrationStartState: RegistrationStartState = RegistrationStartState.USER_DATA_ENTRY;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {}

  openSelfHostedSettings() {
    // TODO: Implement this method for browser
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
