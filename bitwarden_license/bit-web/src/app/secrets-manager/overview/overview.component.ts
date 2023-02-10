import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

@Component({
  selector: "sm-overview",
  templateUrl: "./overview.component.html",
})
export class OverviewComponent {
  protected orgName$ = this.route.params.pipe(
    map((params) => params.organizationId && this.orgService.get(params.organizationId)?.name)
  );

  constructor(private route: ActivatedRoute, private orgService: OrganizationService) {}
}
