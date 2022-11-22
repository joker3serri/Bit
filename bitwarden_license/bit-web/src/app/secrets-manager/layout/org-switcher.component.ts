import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import type { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "org-switcher",
  templateUrl: "org-switcher.component.html",
})
export class OrgSwitcherComponent implements OnInit {
  constructor(private organizationService: OrganizationService) {}
  protected organizations$: Observable<Organization[]>;

  async ngOnInit() {
    this.organizations$ = this.organizationService.organizations$;
  }
}
