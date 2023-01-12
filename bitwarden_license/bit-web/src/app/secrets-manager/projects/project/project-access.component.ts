import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";

@Component({
  selector: "sm-project-access",
  templateUrl: "./project-access.component.html",
})
export class ProjectAccessComponent implements OnInit {
  projectAccessPoliciesView$: Observable<ProjectAccessPoliciesView>;

  @Input() accessType: "projectPeople" | "projectServiceAccounts";
  @Input() description: string;
  @Input() label: string;
  @Input() hint: string;
  @Input() columnTitle: string;
  @Input() emptyMessage: string;

  private organizationId: string;
  private projectId: string;

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  ngOnInit(): void {
    this.projectAccessPoliciesView$ = this.accessPolicyService.projectAccessPolicies$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        this.organizationId = params.organizationId;
        this.projectId = params.projectId;
        return await this.getProjectAccessPolicies();
      })
    );
  }

  private async getProjectAccessPolicies(): Promise<ProjectAccessPoliciesView> {
    return await this.accessPolicyService.getProjectAccessPolicies(
      this.organizationId,
      this.projectId
    );
  }
}
