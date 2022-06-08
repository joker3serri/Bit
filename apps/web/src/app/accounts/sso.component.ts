import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { SsoComponent as BaseSsoComponent } from "@bitwarden/angular/src/components/sso.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { AuthService } from "@bitwarden/common/src/abstractions/auth.service";
import { CryptoFunctionService } from "@bitwarden/common/src/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/src/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PasswordGenerationService } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";

@Component({
  selector: "app-sso",
  templateUrl: "sso.component.html",
})
export class SsoComponent extends BaseSsoComponent {
  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    route: ActivatedRoute,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    cryptoFunctionService: CryptoFunctionService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationService,
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
    this.redirectUri = window.location.origin + "/sso-connector.html";
    this.clientId = "web";
  }

  async ngOnInit() {
    super.ngOnInit();
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.identifier != null) {
        this.identifier = qParams.identifier;
      } else {
        const storedIdentifier = await this.stateService.getSsoOrgIdentifier();
        if (storedIdentifier != null) {
          this.identifier = storedIdentifier;
        }
      }
    });
  }

  async submit() {
    await this.stateService.setSsoOrganizationIdentifier(this.identifier);
    if (this.clientId === "browser") {
      document.cookie = `ssoHandOffMessage=${this.i18nService.t("ssoHandOff")};SameSite=strict`;
    }
    super.submit();
  }
}
