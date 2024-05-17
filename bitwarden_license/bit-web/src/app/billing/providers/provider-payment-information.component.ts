import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { lastValueFrom, Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { DialogService } from "@bitwarden/components";

import {
  openProviderPaymentForm,
  ProviderPaymentFormResultType,
} from "./provider-payment-form.component";

@Component({
  selector: "app-provider-payment-information",
  templateUrl: "./provider-payment-information.component.html",
})
export class ProviderPaymentInformationComponent implements OnInit, OnDestroy {
  providerId: string;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
  ) {}

  changePaymentMethod = async () => {
    const dialogRef = openProviderPaymentForm(this.dialogService, {
      data: {
        providerId: this.providerId,
        initialPaymentMethod: PaymentMethodType.Card,
      },
    });

    const result = await lastValueFrom(dialogRef.closed);

    if (result == ProviderPaymentFormResultType.Submitted) {
      // TODO: Load
    }
  };

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
