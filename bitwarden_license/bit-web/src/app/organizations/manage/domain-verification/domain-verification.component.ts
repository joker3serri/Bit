import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { concatMap, Observable, Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrgDomainApiServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain-api.service.abstraction";
import { OrgDomainServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain.service.abstraction";
import { OrganizationDomainResponse } from "@bitwarden/common/abstractions/organization-domain/responses/organization-domain.response";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { DialogService } from "@bitwarden/components";

import {
  DomainAddEditDialogComponent,
  DomainAddEditDialogData,
} from "./domain-add-edit-dialog/domain-add-edit-dialog.component";

@Component({
  selector: "app-org-manage-domain-verification",
  templateUrl: "domain-verification.component.html",
})
export class DomainVerificationComponent implements OnInit, OnDestroy {
  private componentDestroyed$ = new Subject<void>();

  loading = true;

  organizationId: string;
  // organization: Organization;
  orgDomains$: Observable<OrganizationDomainResponse[]>;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private orgDomainApiService: OrgDomainApiServiceAbstraction,
    private orgDomainService: OrgDomainServiceAbstraction,
    private dialogService: DialogService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async ngOnInit() {
    this.orgDomains$ = this.orgDomainService.orgDomains$;

    // Note: going to use concatMap as async subscribe blocks don't work as you expect and
    // as such, ESLint rejects it
    // ex: https://stackoverflow.com/a/71056380
    this.route.params
      .pipe(
        concatMap(async (params: Params) => {
          this.organizationId = params.organizationId;
          await this.load();
        }),
        takeUntil(this.componentDestroyed$)
      )
      .subscribe();
  }

  async load() {
    await this.orgDomainApiService.getAllByOrgId(this.organizationId);

    this.loading = false;
  }

  addDomain() {
    const domainAddEditDialogData: DomainAddEditDialogData = {
      organizationId: this.organizationId,
      orgDomain: null,
      existingDomainNames: [],
    };

    this.dialogService.open(DomainAddEditDialogComponent, {
      data: domainAddEditDialogData,
    });
  }

  editDomain(orgDomain: OrganizationDomainResponse) {
    const domainAddEditDialogData: DomainAddEditDialogData = {
      organizationId: this.organizationId,
      orgDomain: orgDomain,
      existingDomainNames: [],
    };

    this.dialogService.open(DomainAddEditDialogComponent, {
      data: domainAddEditDialogData,
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
