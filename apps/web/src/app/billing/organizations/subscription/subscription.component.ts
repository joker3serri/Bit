import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, switchMap, Subject, from, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { SubscriptionResponse } from "@bitwarden/common/billing/models/response/new-subscription.response";
import { OrganizationBillingApiClient } from "@bitwarden/common/billing/services/organization-billing-api.client";

import { SharedModule } from "../../../shared";

@Component({
  standalone: true,
  templateUrl: "subscription.component.html",
  imports: [SharedModule],
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  protected loading: boolean;
  protected organization: Organization;
  protected subscription: SubscriptionResponse;

  private destroy$ = new Subject<void>();

  constructor(
    private activateRoute: ActivatedRoute,
    private organizationService: OrganizationService,
    private organizationBillingApiClient: OrganizationBillingApiClient,
  ) {}

  async ngOnInit(): Promise<void> {
    const organization$ = this.activateRoute.params.pipe(
      map((params) => this.organizationService.get(params.organizationId)),
    );

    const subscription$ = organization$.pipe(
      switchMap((organization) =>
        from(this.organizationBillingApiClient.getSubscription(organization.id)),
      ),
    );

    combineLatest([organization$, subscription$])
      .pipe(
        map(([organization, subscription]) => {
          this.organization = organization;
          this.subscription = subscription;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
