import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject, switchMap, takeUntil, tap } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
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
  private refresh$ = new BehaviorSubject<void>(null);

  constructor(
    private organizationAuthRequestService: OrganizationAuthRequestService,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        tap((params) => (this.organizationId = params.organizationId)),
        switchMap(() =>
          this.refresh$.pipe(
            switchMap(() =>
              this.organizationAuthRequestService.listPendingRequests(this.organizationId)
            )
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((r) => {
        this.tableDataSource.data = r;
        this.loading = false;
      });
  }

  denyRequest = async (requestId: string) => {
    await this.organizationAuthRequestService.denyPendingRequests(this.organizationId, requestId);
    this.platformUtilsService.showToast("error", null, this.i18nService.t("loginRequestDenied"));
    this.refresh$.next();
  };

  denyAllRequests = async () => {
    if (this.tableDataSource.data.length === 0) {
      return;
    }

    await this.organizationAuthRequestService.denyPendingRequests(
      this.organizationId,
      ...this.tableDataSource.data.map((r) => r.id)
    );
    this.platformUtilsService.showToast(
      "error",
      null,
      this.i18nService.t("allLoginRequestsDenied")
    );
    this.refresh$.next();
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
