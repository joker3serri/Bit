import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";

@Component({
  standalone: true,
  selector: "auth-registration",
  templateUrl: "registration.page.html",
  imports: [CommonModule, JslibModule],
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
