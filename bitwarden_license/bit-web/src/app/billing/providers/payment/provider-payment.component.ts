import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { from, lastValueFrom, Subject, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";
import { DialogService } from "@bitwarden/components";

import {
  openProviderPaymentDialog,
  ProviderPaymentMethodDialogResultType,
} from "./provider-payment-method-dialog.component";

@Component({
  selector: "app-provider-payment",
  templateUrl: "./provider-payment.component.html",
})
export class ProviderPaymentComponent implements OnInit, OnDestroy {
  protected providerId: string;
  protected provider: Provider;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private providerService: ProviderService,
  ) {}

  changePaymentMethod = async () => {
    const dialogRef = openProviderPaymentDialog(this.dialogService, {
      data: {
        providerId: this.providerId,
      },
    });

    const result = await lastValueFrom(dialogRef.closed);

    if (result == ProviderPaymentMethodDialogResultType.Submitted) {
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
