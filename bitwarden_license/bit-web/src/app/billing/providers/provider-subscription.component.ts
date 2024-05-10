import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, concatMap, takeUntil } from "rxjs";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import {
  Plans,
  ProviderSubscriptionResponse,
} from "@bitwarden/common/billing/models/response/provider-subscription-response";

@Component({
  selector: "app-provider-subscription",
  templateUrl: "./provider-subscription.component.html",
})
export class ProviderSubscriptionComponent {
  subscription: ProviderSubscriptionResponse;
  providerId: string;
  firstLoaded = false;
  loading: boolean;
  private destroy$ = new Subject<void>();
  totalCost: number;
  currentDate = new Date();

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.providerId = params.providerId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  get isExpired() {
    return this.subscription.status == "Active";
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.subscription = await this.billingApiService.getProviderSubscription(this.providerId);
    this.totalCost =
      ((100 - this.subscription.discountPercentage) / 100) * this.sumCost(this.subscription.plans);
    this.loading = false;
  }

  sumCost(plans: Plans[]): number {
    return plans.reduce((acc, plan) => acc + plan.cost, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
