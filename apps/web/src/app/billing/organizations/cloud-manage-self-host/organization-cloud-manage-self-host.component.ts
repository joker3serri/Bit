import { DialogRef } from "@angular/cdk/dialog";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationApiKeyType } from "@bitwarden/common/admin-console/enums";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { PlanType } from "@bitwarden/common/billing/enums";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/billing/models/response/organization-subscription.response";
import { DialogService } from "@bitwarden/components";

import { BillingSyncApiKeyComponent } from "../billing-sync-api-key.component";
import {
  DownloadLicenceDialogComponent,
  DownloadLicenseDialogResult,
} from "../download-license.component";

@Component({
  selector: "app-organization-cloud-manage-self-host",
  templateUrl: "organization-cloud-manage-self-host.component.html",
})
export class OrganizationCloudManageSelfHostComponent implements OnInit {
  @Input({ required: true }) organization: Organization;
  @Input({ required: true }) subscriptionResponse: OrganizationSubscriptionResponse;
  @Output() syncTokenManaged = new EventEmitter<void>();

  protected hasSyncToken = false;

  private plansThatManageSyncTokens = [
    PlanType.EnterpriseAnnually,
    PlanType.EnterpriseMonthly,
    PlanType.EnterpriseAnnually2023,
    PlanType.EnterpriseMonthly2023,
    PlanType.EnterpriseAnnually2020,
    PlanType.EnterpriseMonthly2020,
    PlanType.EnterpriseAnnually2019,
    PlanType.EnterpriseMonthly2019,
  ];

  constructor(
    private dialogService: DialogService,
    private organizationApiService: OrganizationApiServiceAbstraction,
  ) {}

  async ngOnInit() {
    const response = await this.organizationApiService.getApiKeyInformation(this.organization.id);
    this.hasSyncToken = response.data.some(
      (apiKeyInformation) => apiKeyInformation.keyType === OrganizationApiKeyType.BillingSync,
    );
  }

  manageSyncToken = async () => {
    const dialogRef: DialogRef<unknown, BillingSyncApiKeyComponent> =
      BillingSyncApiKeyComponent.open(this.dialogService, {
        organizationId: this.organization.id,
        hasBillingToken: this.hasSyncToken,
      });

    await firstValueFrom(dialogRef.closed);
    this.syncTokenManaged.emit();
  };

  openDownloadLicenseDialog = (): DialogRef<DownloadLicenseDialogResult> =>
    DownloadLicenceDialogComponent.open(this.dialogService, {
      data: {
        organizationId: this.organization.id,
      },
    });

  canDownloadLicense(): boolean {
    return (
      // TODO: What is the purpose of this first check? A non-free organization without a subscription?
      (this.subscriptionResponse.planType !== PlanType.Free &&
        this.subscriptionResponse.subscription == null) ||
      (this.subscriptionResponse.subscription != null &&
        !this.subscriptionResponse.subscription.cancelled)
    );
  }

  canManageSyncToken(): boolean {
    return this.plansThatManageSyncTokens.includes(this.subscriptionResponse.planType);
  }
}
