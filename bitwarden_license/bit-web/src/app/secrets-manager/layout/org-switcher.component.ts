import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import type { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "org-switcher",
  templateUrl: "org-switcher.component.html",
})
export class OrgSwitcherComponent implements OnInit {
  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}
  protected organizations$: Observable<Organization[]> = this.organizationService.organizations$;
  protected activeOrganization$: Observable<Organization> = this.route.paramMap.pipe(
    map((pm) => this.organizationService.get(pm.get("organizationId")))
  );

  async ngOnInit() {
    this.organizations$ = this.organizationService.organizations$;
  }
}
