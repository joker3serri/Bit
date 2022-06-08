import { Component } from "@angular/core";

import { PasswordGeneratorHistoryComponent as BasePasswordGeneratorHistoryComponent } from "@bitwarden/angular/src/components/password-generator-history.component";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { PasswordGenerationService } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";

@Component({
  selector: "app-password-generator-history",
  templateUrl: "password-generator-history.component.html",
})
export class PasswordGeneratorHistoryComponent extends BasePasswordGeneratorHistoryComponent {
  constructor(
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService
  ) {
    super(passwordGenerationService, platformUtilsService, i18nService, window);
  }
}
