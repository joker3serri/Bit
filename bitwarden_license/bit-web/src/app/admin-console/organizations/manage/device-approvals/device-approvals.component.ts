import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil, tap } from "rxjs";

import { Icons, TableDataSource } from "@bitwarden/components";

import { OrganizationAuthRequestService } from "../../core/services/auth-requests";
import { PendingAuthRequestView } from "../../core/views/pending-auth-request.view";

@Component({
  selector: "app-org-device-approvals",
  templateUrl: "./device-approvals.component.html",
})
export class DeviceApprovalsComponent implements OnInit, OnDestroy {
  tableDataSource = new TableDataSource<PendingAuthRequestView>();
  organizationId: string;
  loading = true;

  protected readonly Devices = Icons.Devices;

  private destroy$ = new Subject<void>();

  constructor(
    private organizationAuthRequestService: OrganizationAuthRequestService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        tap((params) => (this.organizationId = params.organizationId)),
        concatMap(() =>
          this.organizationAuthRequestService.listPendingRequests(this.organizationId)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((r) => {
        this.tableDataSource.data = r;
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
