import { AfterContentInit, Directive, HostListener, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SsoComponent } from "@bitwarden/angular/auth/components/sso.component";
import { LoginStrategyServiceAbstraction } from "@bitwarden/auth/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { InternalMasterPasswordServiceAbstraction } from "@bitwarden/common/auth/abstractions/master-password.service.abstraction";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

@Directive({
  selector: "[app-link-sso]",
})
export class LinkSsoDirective extends SsoComponent implements AfterContentInit {
  @Input() organization: Organization;
  returnUri = "/settings/organizations";

  @HostListener("click", ["$event"])
  async onClick($event: MouseEvent) {
    $event.preventDefault();
    await this.submit(this.returnUri, true);
  }

  constructor(
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    apiService: ApiService,
    loginStrategyService: LoginStrategyServiceAbstraction,
    router: Router,
    route: ActivatedRoute,
    cryptoFunctionService: CryptoFunctionService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    stateService: StateService,
    environmentService: EnvironmentService,
    logService: LogService,
    configService: ConfigServiceAbstraction,
    masterPasswordService: InternalMasterPasswordServiceAbstraction,
    accountService: AccountService,
  ) {
    super(
      loginStrategyService,
      router,
      i18nService,
      route,
      stateService,
      platformUtilsService,
      apiService,
      cryptoFunctionService,
      environmentService,
      passwordGenerationService,
      logService,
      configService,
      masterPasswordService,
      accountService,
    );

    this.returnUri = "/settings/organizations";
    this.redirectUri = window.location.origin + "/sso-connector.html";
    this.clientId = "web";
  }

  async ngAfterContentInit() {
    this.identifier = this.organization.identifier;
  }
}
