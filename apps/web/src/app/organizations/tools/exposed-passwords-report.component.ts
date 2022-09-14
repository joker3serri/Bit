import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { CipherAdminServiceAbstraction } from "@bitwarden/common/abstractions/cipher/cipher-admin.service.abstraction";
import { CipherService } from "@bitwarden/common/abstractions/cipher/cipher.service.abstraction";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PasswordRepromptService } from "@bitwarden/common/abstractions/passwordReprompt.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Cipher } from "@bitwarden/common/models/domain/cipher";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

// eslint-disable-next-line no-restricted-imports
import { ExposedPasswordsReportComponent as BaseExposedPasswordsReportComponent } from "../../reports/pages/exposed-passwords-report.component";

@Component({
  selector: "app-org-exposed-passwords-report",
  templateUrl: "../../reports/pages/exposed-passwords-report.component.html",
})
export class ExposedPasswordsReportComponent extends BaseExposedPasswordsReportComponent {
  manageableCiphers: Cipher[];

  constructor(
    cipherService: CipherService,
    auditService: AuditService,
    modalService: ModalService,
    messagingService: MessagingService,
    stateService: StateService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    passwordRepromptService: PasswordRepromptService,
    private cipherAdminService: CipherAdminServiceAbstraction
  ) {
    super(
      cipherService,
      auditService,
      modalService,
      messagingService,
      stateService,
      passwordRepromptService
    );
  }

  ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.manageableCiphers = await this.cipherService.getAll();
      await this.checkAccess();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherAdminService.getAllFromApiForOrganization(this.organization.id);
  }

  canManageCipher(c: CipherView): boolean {
    return this.manageableCiphers.some((x) => x.id === c.id);
  }
}
