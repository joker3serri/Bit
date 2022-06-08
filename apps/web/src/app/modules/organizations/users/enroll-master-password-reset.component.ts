import { Component } from "@angular/core";

import { ModalRef } from "@bitwarden/angular/src/components/modal/modal.ref";
import { ModalConfig } from "@bitwarden/angular/src/services/modal.service";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { SyncService } from "@bitwarden/common/src/abstractions/sync.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";
import { Utils } from "@bitwarden/common/src/misc/utils";
import { Organization } from "@bitwarden/common/src/models/domain/organization";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/src/models/request/organizationUserResetPasswordEnrollmentRequest";
import { Verification } from "@bitwarden/common/src/types/verification";

@Component({
  selector: "app-enroll-master-password-reset",
  templateUrl: "enroll-master-password-reset.component.html",
})
export class EnrollMasterPasswordReset {
  organization: Organization;

  verification: Verification;
  formPromise: Promise<any>;

  constructor(
    private userVerificationService: UserVerificationService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private cryptoService: CryptoService,
    private syncService: SyncService,
    private logService: LogService,
    private modalRef: ModalRef,
    config: ModalConfig
  ) {
    this.organization = config.data.organization;
  }

  async submit() {
    let toastStringRef = "withdrawPasswordResetSuccess";

    this.formPromise = this.userVerificationService
      .buildRequest(this.verification, OrganizationUserResetPasswordEnrollmentRequest)
      .then(async (request) => {
        // Set variables
        let keyString: string = null;

        // Enrolling
        if (!this.organization.resetPasswordEnrolled) {
          // Retrieve Public Key
          const orgKeys = await this.apiService.getOrganizationKeys(this.organization.id);
          if (orgKeys == null) {
            throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
          }

          const publicKey = Utils.fromB64ToArray(orgKeys.publicKey);

          // RSA Encrypt user's encKey.key with organization public key
          const encKey = await this.cryptoService.getEncKey();
          const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);
          keyString = encryptedKey.encryptedString;
          toastStringRef = "enrollPasswordResetSuccess";

          // Create request and execute enrollment
          request.resetPasswordKey = keyString;
          await this.apiService.putOrganizationUserResetPasswordEnrollment(
            this.organization.id,
            this.organization.userId,
            request
          );
        } else {
          // Withdrawal
          request.resetPasswordKey = keyString;
          await this.apiService.putOrganizationUserResetPasswordEnrollment(
            this.organization.id,
            this.organization.userId,
            request
          );
        }

        await this.syncService.fullSync(true);
      });
    try {
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t(toastStringRef));
      this.modalRef.close();
    } catch (e) {
      this.logService.error(e);
    }
  }

  get isEnrolled(): boolean {
    return this.organization.resetPasswordEnrolled;
  }
}
