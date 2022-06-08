import { AfterContentInit, Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SsoComponent } from "@bitwarden/angular/src/components/sso.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { AuthService } from "@bitwarden/common/src/abstractions/auth.service";
import { CryptoFunctionService } from "@bitwarden/common/src/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/src/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PasswordGenerationService } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { Organization } from "@bitwarden/common/src/models/domain/organization";

@Component({
  selector: "app-link-sso",
  templateUrl: "link-sso.component.html",
})
export class LinkSsoComponent extends SsoComponent implements AfterContentInit {
  @Input() organization: Organization;
  returnUri = "/settings/organizations";

  constructor(
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    apiService: ApiService,
    authService: AuthService,
    router: Router,
    route: ActivatedRoute,
    cryptoFunctionService: CryptoFunctionService,
    passwordGenerationService: PasswordGenerationService,
    stateService: StateService,
    environmentService: EnvironmentService,
    logService: LogService
  ) {
    super(
      authService,
      router,
      i18nService,
      route,
      stateService,
      platformUtilsService,
      apiService,
      cryptoFunctionService,
      environmentService,
      passwordGenerationService,
      logService
    );

    this.returnUri = "/settings/organizations";
    this.redirectUri = window.location.origin + "/sso-connector.html";
    this.clientId = "web";
  }

  async ngAfterContentInit() {
    this.identifier = this.organization.identifier;
  }
}
