import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subject, startWith, takeUntil } from "rxjs";

import { ControlsOf } from "@bitwarden/angular/types/controls-of";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { ProductType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { SecretsManagerLogo } from "../../../../../../../bitwarden_license/bit-web/src/app/secrets-manager/layout/secrets-manager-logo";

export interface SecretsManagerSubscription {
  enabled: boolean;
  userSeats: number;
  additionalServiceAccounts: number;
}

@Component({
  selector: "sm-subscribe",
  templateUrl: "sm-subscribe.component.html",
})
export class SecretsManagerSubscribeComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup<ControlsOf<SecretsManagerSubscription>>;
  @Input() createOrganization: boolean;

  private _selectedPlan: PlanResponse;

  logo = SecretsManagerLogo;
  productTypes = ProductType;

  private destroy$ = new Subject<void>();

  constructor(private i18nService: I18nService) {}

  ngOnInit() {
    this.formGroup.controls.enabled.valueChanges
      .pipe(startWith(this.formGroup.value.enabled), takeUntil(this.destroy$))
      .subscribe((enabled) => {
        if (enabled) {
          this.formGroup.controls.userSeats.enable();
          this.formGroup.controls.additionalServiceAccounts.enable();
        } else {
          this.formGroup.controls.userSeats.disable();
          this.formGroup.controls.additionalServiceAccounts.disable();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get product() {
    return this.selectedPlan.product;
  }

  get planName() {
    switch (this.product) {
      case ProductType.Free:
        return this.i18nService.t("free2PersonOrganization");
      case ProductType.Teams:
        return this.i18nService.t("planNameTeams");
      case ProductType.Enterprise:
        return this.i18nService.t("planNameEnterprise");
    }
  }

  get serviceAccountsIncluded() {
    return this.selectedPlan.baseServiceAccount;
  }

  get monthlyCostPerServiceAccount() {
    return this.selectedPlan.isAnnual
      ? this.selectedPlan.additionalPricePerServiceAccount / 12
      : this.selectedPlan.additionalPricePerServiceAccount;
  }

  get maxUsers() {
    return this.selectedPlan.maxUsers;
  }

  get maxProjects() {
    return this.selectedPlan.maxProjects;
  }

  get monthlyCostPerUser() {
    return this.selectedPlan.isAnnual
      ? this.selectedPlan.seatPrice / 12
      : this.selectedPlan.seatPrice;
  }

  // TODO: should get supports SM value from plan itself
  // TODO move to parent component or it just wont' run if the component isn't rendered
  @Input() set selectedPlan(value: PlanResponse) {
    this._selectedPlan = value;

    if (this.selectedPlan.product === ProductType.Families) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  get selectedPlan() {
    return this._selectedPlan;
  }
}
