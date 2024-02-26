import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, switchMap, Subject, takeUntil, concatMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { Subscription } from "@bitwarden/common/billing/models/domain/subscription";
import { OrganizationBillingService } from "@bitwarden/common/billing/services/organization-billing.service";

import { SharedModule } from "../../../shared";
import { OrganizationBillingModule } from "../organization-billing.module";

import { OrganizationSubscriptionStatusComponent } from "./organization-subscription-status.component";

@Component({
  standalone: true,
  templateUrl: "organization-subscription.component.html",
  imports: [SharedModule, OrganizationBillingModule, OrganizationSubscriptionStatusComponent],
})
export class OrganizationSubscriptionComponent implements OnInit, OnDestroy {
  protected loading: boolean;
  protected organization: Organization;
  protected subscription: Subscription;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private organizationService: OrganizationService,
    private organizationBillingService: OrganizationBillingService,
  ) {}

  async ngOnInit(): Promise<void> {
    const organization$ = this.activatedRoute.params.pipe(
      map((params) => this.organizationService.get(params.organizationId)),
    );

    const subscription$ = organization$.pipe(
      switchMap((organization) =>
        this.organizationBillingService.getSubscription$(organization.id),
      ),
    );

    combineLatest([organization$, subscription$])
      .pipe(
        concatMap(async ([organization, subscription]) => {
          this.organization = organization;
          this.subscription = subscription
            ? subscription
            : await this.organizationBillingService.pullSubscription(organization.id);
          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasData() {
    return this.organization && this.subscription;
  }
}
