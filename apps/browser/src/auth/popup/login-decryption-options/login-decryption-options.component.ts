import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseLoginDecryptionOptionsComponent } from "@bitwarden/angular/auth/components/base-login-decryption-options.component";
import { DeviceCryptoServiceAbstraction } from "@bitwarden/common/abstractions/device-crypto.service.abstraction";
import { DevicesApiServiceAbstraction } from "@bitwarden/common/abstractions/devices/devices-api.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Component({
  selector: "browser-login-decryption-options",
  templateUrl: "login-decryption-options.component.html",
})
export class LoginDecryptionOptionsComponent extends BaseLoginDecryptionOptionsComponent {
  constructor(
    formBuilder: FormBuilder,
    devicesApiService: DevicesApiServiceAbstraction,
    stateService: StateService,
    router: Router,
    activatedRoute: ActivatedRoute,
    messagingService: MessagingService,
    tokenService: TokenService,
    loginService: LoginService,
    organizationApiService: OrganizationApiServiceAbstraction,
    cryptoService: CryptoService,
    deviceCryptoService: DeviceCryptoServiceAbstraction,
    organizationUserSerivce: OrganizationUserService,
    i18nService: I18nService
  ) {
    super(
      formBuilder,
      devicesApiService,
      stateService,
      router,
      activatedRoute,
      messagingService,
      tokenService,
      loginService,
      organizationApiService,
      cryptoService,
      deviceCryptoService,
      organizationUserSerivce,
      i18nService
    );
  }
}
