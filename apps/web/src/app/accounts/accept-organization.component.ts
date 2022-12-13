import { Component } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

import { BaseAcceptComponent } from "../common/base.accept.component";

@Component({
  selector: "app-accept-organization",
  templateUrl: "accept-organization.component.html",
})
export class AcceptOrganizationComponent extends BaseAcceptComponent {
  orgName: string;

  protected requiredParameters: string[] = ["organizationId", "organizationUserId", "token"];

  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute,
    stateService: StateService
  ) {
    super(router, platformUtilsService, i18nService, route, stateService);
  }

  async authedHandler(qParams: Params): Promise<void> {
    // Forcing the user to login to evaluate if the user's password meets the Organization password policy requirements
    await this.stateService.setActiveUser(null);
    await this.unauthedHandler(qParams);
  }

  async unauthedHandler(qParams: Params): Promise<void> {
    this.email = qParams.email;
    this.orgName = qParams.organizationName;
    if (this.orgName != null) {
      // Fix URL encoding of space issue with Angular
      this.orgName = this.orgName.replace(/\+/g, " ");
    }
    await this.stateService.setOrganizationInvitation(qParams);
  }
}
