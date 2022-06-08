import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/src/services/modal.service";
import { CipherService } from "@bitwarden/common/src/abstractions/cipher.service";
import { MessagingService } from "@bitwarden/common/src/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/src/abstractions/organization.service";
import { PasswordRepromptService } from "@bitwarden/common/src/abstractions/passwordReprompt.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { CipherView } from "@bitwarden/common/src/models/view/cipherView";

import { UnsecuredWebsitesReportComponent as BaseUnsecuredWebsitesReportComponent } from "../../reports/unsecured-websites-report.component";

@Component({
  selector: "app-unsecured-websites-report",
  templateUrl: "../../reports/unsecured-websites-report.component.html",
})
export class UnsecuredWebsitesReportComponent extends BaseUnsecuredWebsitesReportComponent {
  constructor(
    cipherService: CipherService,
    modalService: ModalService,
    messagingService: MessagingService,
    stateService: StateService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(cipherService, modalService, messagingService, stateService, passwordRepromptService);
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      await super.ngOnInit();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }
}
