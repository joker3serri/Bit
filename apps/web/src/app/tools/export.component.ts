import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { ExportComponent as BaseExportComponent } from "@bitwarden/angular/src/components/export.component";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { EventService } from "@bitwarden/common/src/abstractions/event.service";
import { ExportService } from "@bitwarden/common/src/abstractions/export.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";

@Component({
  selector: "app-export",
  templateUrl: "export.component.html",
})
export class ExportComponent extends BaseExportComponent {
  organizationId: string;

  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    exportService: ExportService,
    eventService: EventService,
    policyService: PolicyService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    formBuilder: FormBuilder
  ) {
    super(
      cryptoService,
      i18nService,
      platformUtilsService,
      exportService,
      eventService,
      policyService,
      window,
      logService,
      userVerificationService,
      formBuilder
    );
  }

  protected saved() {
    super.saved();
    this.platformUtilsService.showToast("success", null, this.i18nService.t("exportSuccess"));
  }
}
