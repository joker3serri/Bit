import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntil, Subject } from "rxjs";

import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";

@Component({
  selector: "sm-project-service-accounts",
  templateUrl: "./project-service-accounts.component.html",
})
export class ProjectServiceAccountsComponent {
  private destroy$ = new Subject<void>();
  private organizationId: string;
  private projectId: string;

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected getPotentialGrantees() {
    return this.accessPolicyService.getServiceAccountPotentialGrantees(
      this.organizationId,
      this.projectId
    );
  }
}
