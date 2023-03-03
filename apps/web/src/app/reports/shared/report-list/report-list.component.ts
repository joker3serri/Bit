import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { ReportEntry } from "../models/report-entry";

@Component({
  selector: "app-report-list",
  templateUrl: "report-list.component.html",
})
export class ReportListComponent implements OnInit, OnDestroy {
  @Input() reports: ReportEntry[];
  organization: Organization;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private messagingService: MessagingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.parent.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organization = this.organizationService.get(params.organizationId);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkAccess(route: string) {
    if (this.organization != null) {
      // TODO: Maybe we want to just make sure they are not on a free plan? Just compare useTotp for now
      // since all paid plans include useTotp
      if (!this.organization.useTotp) {
        this.messagingService.send("upgradeOrganization", { organizationId: this.organization.id });
        return;
      }
    }
    this.router.navigate([route], { relativeTo: this.route });
  }
}
