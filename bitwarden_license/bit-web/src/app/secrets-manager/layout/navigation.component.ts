import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { SecretsManagerLogo } from "./secrets-manager-logo";

@Component({
  selector: "sm-navigation",
  templateUrl: "./navigation.component.html",
})
export class NavigationComponent {
  private destroy$ = new Subject<void>();
  protected organization: Organization;
  protected readonly logo = SecretsManagerLogo;

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params) => {
          return this.organizationService.get(params.organizationId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((org) => {
        this.organization = org;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected orgFilter = (org: Organization) => org.canAccessSecretsManager;
}
