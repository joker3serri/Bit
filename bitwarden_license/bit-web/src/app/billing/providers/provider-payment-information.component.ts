import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { from, lastValueFrom, Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";
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
  protected providerId: string;
  protected provider: Provider;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private providerService: ProviderService,
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
      await this.load();
    }
  };

  async load() {
    this.provider = await this.providerService.get(this.providerId);
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap(({ providerId }) => {
          this.providerId = providerId;
          return from(this.load());
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
