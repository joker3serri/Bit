import { Component } from "@angular/core";
import { Observable } from "rxjs";

import { NavigationModule } from "@bitwarden/components";

import { BillingSharedModule } from "../billing/shared/billing-shared.module";

import { FreeFamiliesPolicyService } from "./../billing/services/free-families-policy.service";

@Component({
  selector: "billing-free-families-nav-item",
  templateUrl: "./billing-free-families-nav-item.component.html",
  standalone: true,
  imports: [NavigationModule, BillingSharedModule],
})
export class BillingFreeFamiliesNavItemComponent {
  showFreeFamilies$: Observable<boolean>;

  constructor(private freeFamiliesPolicyService: FreeFamiliesPolicyService) {
    this.showFreeFamilies$ = this.freeFamiliesPolicyService.showFreeFamilies$;
  }
}
