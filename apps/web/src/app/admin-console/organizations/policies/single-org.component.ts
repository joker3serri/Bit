import { Component, OnInit } from "@angular/core";

import { OrgDomainApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization-domain/org-domain-api.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { PolicyRequest } from "@bitwarden/common/admin-console/models/request/policy.request";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class SingleOrgPolicy extends BasePolicy {
  name = "singleOrg";
  description = "singleOrgPolicyDesc";
  type = PolicyType.SingleOrg;
  component = SingleOrgPolicyComponent;
}

@Component({
  selector: "policy-single-org",
  templateUrl: "single-org.component.html",
})
export class SingleOrgPolicyComponent extends BasePolicyComponent implements OnInit {
  constructor(
    private i18nService: I18nService,
    private configService: ConfigService,
    private orgDomainApiService: OrgDomainApiServiceAbstraction,
  ) {
    super();
  }

  async ngOnInit() {
    super.ngOnInit();

    if (await this.hasVerifiedDomains()) {
      this.enabled.disable();
    }
  }

  private async hasVerifiedDomains(): Promise<boolean> {
    return (
      this.enabled.value &&
      (await this.configService.getFeatureFlag(FeatureFlag.AccountDeprovisioning)) &&
      (await this.orgDomainApiService.getAllByOrgId(this.policyResponse.organizationId)).some(
        (x) => x.verifiedDate !== null,
      )
    );
  }

  async buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
    if (await this.configService.getFeatureFlag(FeatureFlag.Pm13322AddPolicyDefinitions)) {
      // We are now relying on server-side validation only
      return super.buildRequest(policiesEnabledMap);
    }

    if (!this.enabled.value) {
      if (policiesEnabledMap.get(PolicyType.RequireSso) ?? false) {
        throw new Error(
          this.i18nService.t("disableRequiredError", this.i18nService.t("requireSso")),
        );
      }

      if (policiesEnabledMap.get(PolicyType.MaximumVaultTimeout) ?? false) {
        throw new Error(
          this.i18nService.t(
            "disableRequiredError",
            this.i18nService.t("maximumVaultTimeoutLabel"),
          ),
        );
      }
    }

    return super.buildRequest(policiesEnabledMap);
  }
}
