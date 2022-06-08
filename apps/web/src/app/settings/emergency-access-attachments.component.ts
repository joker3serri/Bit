import { Component } from "@angular/core";

import { AttachmentsComponent as BaseAttachmentsComponent } from "@bitwarden/angular/src/components/attachments.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CipherService } from "@bitwarden/common/src/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { AttachmentView } from "@bitwarden/common/src/models/view/attachmentView";

@Component({
  selector: "emergency-access-attachments",
  templateUrl: "../vault/attachments.component.html",
})
export class EmergencyAccessAttachmentsComponent extends BaseAttachmentsComponent {
  viewOnly = true;
  canAccessAttachments = true;

  constructor(
    cipherService: CipherService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    logService: LogService
  ) {
    super(
      cipherService,
      i18nService,
      cryptoService,
      platformUtilsService,
      apiService,
      window,
      logService,
      stateService
    );
  }

  protected async init() {
    // Do nothing since cipher is already decoded
  }

  protected showFixOldAttachments(attachment: AttachmentView) {
    return false;
  }
}
