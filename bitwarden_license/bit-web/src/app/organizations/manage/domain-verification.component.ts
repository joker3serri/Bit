import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-org-manage-domain-verification",
  templateUrl: "domain-verification.component.html",
})
export class DomainVerificationComponent implements OnInit, OnDestroy {
  private componentDestroyed$ = new Subject<void>();

  organization: Organization;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async ngOnInit() {}

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
