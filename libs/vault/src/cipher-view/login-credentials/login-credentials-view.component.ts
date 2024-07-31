import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";
import {
  CardComponent,
  FormFieldModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
  IconButtonModule,
  BadgeModule,
  ColorPasswordModule,
} from "@bitwarden/components";

@Component({
  selector: "app-login-credentials-view",
  templateUrl: "login-credentials-view.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    FormFieldModule,
    IconButtonModule,
    BadgeModule,
    ColorPasswordModule,
  ],
})
export class LoginCredentialsViewComponent {
  @Input() login: LoginView;
  @Input() viewPassword: boolean;
  isPremium$: Observable<boolean> = this.billingAccountProfileStateService.hasPremiumFromAnySource$;
  showPasswordCount: boolean = false;

  constructor(
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private router: Router,
  ) {}

  async getPremium() {
    await this.router.navigate(["/premium"]);
  }

  togglePasswordCount() {
    this.showPasswordCount = !this.showPasswordCount;
  }
}
