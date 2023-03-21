import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, Observable, Subject, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { ReportVariant, reports, ReportType, ReportEntry } from "../../reports";

@Component({
  selector: "app-org-reports-home",
  templateUrl: "reports-home.component.html",
})
export class ReportsHomeComponent implements OnInit, OnDestroy {
  reports$: Observable<ReportEntry[]>;
  organization: Organization;
  homepage = true;
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private stateService: StateService,
    private organizationService: OrganizationService,
    router: Router
  ) {
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.homepage = (event as NavigationEnd).urlAfterRedirects.endsWith("/reports");
      });
  }

  async ngOnInit(): Promise<void> {
    this.reports$ = this.route.params.pipe(
      map((params) => this.organizationService.get(params.organizationId)),
      map((org) => this.buildReports(org.isFreeOrg))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildReports(upgradeRequired: boolean): ReportEntry[] {
    const reportRequiresUpgrade = upgradeRequired
      ? ReportVariant.RequiresUpgrade
      : ReportVariant.Enabled;

    return [
      {
        ...reports[ReportType.ExposedPasswords],
        variant: reportRequiresUpgrade,
      },
      {
        ...reports[ReportType.ReusedPasswords],
        variant: reportRequiresUpgrade,
      },
      {
        ...reports[ReportType.WeakPasswords],
        variant: reportRequiresUpgrade,
      },
      {
        ...reports[ReportType.UnsecuredWebsites],
        variant: reportRequiresUpgrade,
      },
      {
        ...reports[ReportType.Inactive2fa],
        variant: reportRequiresUpgrade,
      },
    ];
  }
}
