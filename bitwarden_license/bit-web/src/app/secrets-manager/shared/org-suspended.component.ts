import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Icon, Icons } from "@bitwarden/components";

@Component({
  templateUrl: "./org-suspended.component.html",
})
export class OrgSuspendedComponent implements OnInit, OnDestroy {
  constructor(private organizationService: OrganizationService, private route: ActivatedRoute) {}

  protected organizationName: string;
  protected NoAccess: Icon = Icons.NoAccess;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationName = this.organizationService.get(params.organizationId)?.name;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
