import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { switchMap } from "rxjs";

import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";

@Component({
  selector: "sm-project-service-accounts",
  templateUrl: "./project-service-accounts.component.html",
})
export class ProjectServiceAccountsComponent {
  protected potentialGrantees$ = this.route.params.pipe(
    switchMap((params) =>
      this.accessPolicyService.getServiceAccountPotentialGrantees(
        params.organizationId,
        params.projectId
      )
    )
  );

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}
}
