import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Subject, takeUntil } from "rxjs";

import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions";

@Component({
  templateUrl: "./provider-billing-history.component.html",
})
export class ProviderBillingHistoryComponent implements OnInit, OnDestroy {
  private providerId: string;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private billingApiService: BillingApiServiceAbstraction,
  ) {}

  exportClientReport = (invoiceNumber: string) => Promise.resolve();

  getInvoices = async () => await this.billingApiService.getProviderInvoices(this.providerId);

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        map(({ providerId }) => {
          this.providerId = providerId;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
