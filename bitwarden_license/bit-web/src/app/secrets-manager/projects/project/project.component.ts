import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, switchMap } from "rxjs";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";

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
    private validationService: ValidationService,
    private accessPolicyService: AccessPolicyService
  ) {}

  ngOnInit(): void {
    this.project$ = this.route.params.pipe(
      switchMap(async (params) => {
        this.userHasWriteAccess = await this.userHasWriteAccessToProject(params.projectId);
        return this.projectService.getByProjectId(params.projectId);
      })
    );
  }

  private async userHasWriteAccessToProject(projectId: string): Promise<boolean> {
    try {
      const [read, write] = await this.accessPolicyService.getProjectAccess(projectId);
      if (write && read) {
        return true;
      }
      return false;
    } catch (e) {
      this.validationService.showError(e);
    }
  }
}
