import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { RegistrationStartComponent } from "@bitwarden/auth/angular";

@Component({
  standalone: true,
  selector: "auth-registration-page",
  templateUrl: "registration-start.page.html",
  imports: [CommonModule, JslibModule, RegistrationStartComponent],
})
export class RegistrationPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
