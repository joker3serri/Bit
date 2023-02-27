import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, switchMap } from "rxjs";

import { ProjectView } from "../../models/view/project.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import { ProjectService } from "../project.service";

@Component({
  selector: "sm-project",
  templateUrl: "./project.component.html",
})
export class ProjectComponent implements OnInit {
  project$: Observable<ProjectView>;
  userHasWriteAccess: boolean;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private accessPolicyService: AccessPolicyService
  ) {}

  ngOnInit(): void {
    this.project$ = this.route.params.pipe(
      switchMap(async (params) => {
        this.userHasWriteAccess = await this.userHasWriteAccessToProject(
          params.organizationId,
          params.projectId
        );
        return this.projectService.getByProjectId(params.projectId);
      })
    );
  }

  private async userHasWriteAccessToProject(
    organizationId: string,
    projectId: string
  ): Promise<boolean> {
    try {
      const projectAccessPolicies = await this.accessPolicyService.getProjectAccessPolicies(
        organizationId,
        projectId
      );
      if (projectAccessPolicies) {
        return true;
      }
      return false;
    } catch (ex) {
      return false;
    }
  }
}
