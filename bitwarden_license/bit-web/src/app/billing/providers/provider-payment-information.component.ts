import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-provider-payment-information",
  templateUrl: "./provider-payment-information.component.html",
})
export class ProviderPaymentInformationComponent implements OnInit, OnDestroy {
  providerId: string;
  private destroy$ = new Subject<void>();

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap(async (params) => {
          this.providerId = params.providerId;
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
