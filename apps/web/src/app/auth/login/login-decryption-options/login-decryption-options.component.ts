import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseLoginDecryptionOptionsComponent } from "@bitwarden/angular/auth/components/base-login-decryption-options.component";
import { AutoEnrollService } from "@bitwarden/angular/auth/services/auto-enroll.service.abstraction";
import { DevicesApiServiceAbstraction } from "@bitwarden/common/abstractions/devices/devices-api.service.abstraction";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
@Component({
  selector: "web-login-decryption-options",
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
    autoEnrollService: AutoEnrollService,
    organizationApiService: OrganizationApiServiceAbstraction
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
      autoEnrollService,
      organizationApiService
    );
  }
}
