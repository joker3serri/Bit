import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { switchMap } from "rxjs";

import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";

@Component({
  selector: "sm-project-people",
  templateUrl: "./project-people.component.html",
})
export class ProjectPeopleComponent {
  protected potentialGrantees$ = this.route.params.pipe(
    switchMap((params) =>
      this.accessPolicyService.getPeoplePotentialGrantees(params.organizationId, params.projectId)
    )
  );

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}
}
