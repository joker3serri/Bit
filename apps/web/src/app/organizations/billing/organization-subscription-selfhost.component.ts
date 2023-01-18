import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, takeUntil, Subject } from "rxjs";

import { ModalConfig, ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { OrganizationConnectionType } from "@bitwarden/common/enums/organizationConnectionType";
import { BillingSyncConfigApi } from "@bitwarden/common/models/api/billing-sync-config.api";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationConnectionResponse } from "@bitwarden/common/models/response/organization-connection.response";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/models/response/organization-subscription.response";

import {
  BillingSyncKeyComponent,
  BillingSyncKeyModalData,
} from "../../settings/billing-sync-key.component";

@Component({
  selector: "app-org-subscription-selfhost",
  templateUrl: "organization-subscription-selfhost.component.html",
})
export class OrganizationSubscriptionSelfhostComponent implements OnInit, OnDestroy {
  sub: OrganizationSubscriptionResponse;
  organizationId: string;
  userOrg: Organization;
  showUpdateLicense = false;
  showBillingSyncKey = false;

  firstLoaded = false;
  loading = false;

  private existingBillingSyncConnection: OrganizationConnectionResponse<BillingSyncConfigApi>;

  private destroy$ = new Subject<void>();

  constructor(
    private modalService: ModalService,
    private messagingService: MessagingService,
    private apiService: ApiService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.organizationId = params.organizationId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.showBillingSyncKey = await this.apiService.getCloudCommunicationsEnabled();

    if (this.showBillingSyncKey) {
      this.existingBillingSyncConnection = await this.apiService.getOrganizationConnection(
        this.organizationId,
        OrganizationConnectionType.CloudBillingSync,
        BillingSyncConfigApi
      );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.userOrg = this.organizationService.get(this.organizationId);
    if (this.userOrg.canManageBilling) {
      this.sub = await this.organizationApiService.getSubscription(this.organizationId);
    }

    this.loading = false;
  }

  updateLicense() {
    if (this.loading) {
      return;
    }
    this.showUpdateLicense = true;
  }

  closeUpdateLicense(updated: boolean) {
    this.showUpdateLicense = false;
    if (updated) {
      this.load();
      this.messagingService.send("updatedOrgLicense");
    }
  }

  manageBillingSyncSelfHosted() {
    const modalConfig: ModalConfig<BillingSyncKeyModalData> = {
      data: {
        entityId: this.organizationId,
        existingConnectionId: this.existingBillingSyncConnection?.id,
        billingSyncKey: this.existingBillingSyncConnection?.config?.billingSyncKey,
        setParentConnection: (connection: OrganizationConnectionResponse<BillingSyncConfigApi>) => {
          this.existingBillingSyncConnection = connection;
        },
      },
    };

    this.modalService.open(BillingSyncKeyComponent, modalConfig);
  }

  get billingSyncSetUp() {
    return this.existingBillingSyncConnection?.id != null;
  }

  get isExpired() {
    return this.sub?.expiration != null && new Date(this.sub.expiration) < new Date();
  }
}
