import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, switchMap } from "rxjs";

import { ProjectService } from "../projects/project.service";
import { SecretService } from "../secrets/secret.service";
import { ServiceAccountService } from "../service-accounts/service-account.service";

@Component({
  selector: "sm-overview",
  templateUrl: "./overview.component.html",
})
export class OverviewComponent {
  protected completed$: Observable<{
    importSecrets: boolean;
    createSecret: boolean;
    createProject: boolean;
    createServiceAccount: boolean;
  }> = this.route.params.pipe(
    switchMap(({ organizationId }) =>
      Promise.all([
        this.projectService.getProjects(organizationId),
        this.secretService.getSecrets(organizationId),
        this.serviceAccountService.getServiceAccounts(organizationId),
      ])
    ),
    map(([projects, secrets, serviceAccounts]) => {
      return {
        importSecrets: secrets.length > 0,
        createSecret: secrets.length > 0,
        createProject: projects.length > 0,
        createServiceAccount: serviceAccounts.length > 0,
      };
    })
  );

  protected onboardingIncomplete$ = this.completed$.pipe(
    map((completed) => Object.values(completed).includes(false))
  );

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private secretService: SecretService,
    private serviceAccountService: ServiceAccountService
  ) {}

  alert() {
    alert("hi");
  }
}
