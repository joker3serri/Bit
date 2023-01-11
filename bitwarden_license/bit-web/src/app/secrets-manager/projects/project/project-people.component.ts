import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";

@Component({
  selector: "sm-project-people",
  templateUrl: "./project-people.component.html",
})
export class ProjectPeopleComponent implements OnInit {
  projectAccessPoliciesView$: Observable<ProjectAccessPoliciesView>;

  private organizationId: string;
  private projectId: string;

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  ngOnInit() {
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
