import { Inject, Injectable } from "@angular/core";

import { WINDOW } from "@bitwarden/angular/src/services/jslib-services.module";
import { CryptoService as CryptoServiceAbstraction } from "@bitwarden/common/src/abstractions/crypto.service";
import {
  EnvironmentService as EnvironmentServiceAbstraction,
  Urls,
} from "@bitwarden/common/src/abstractions/environment.service";
import { EventService as EventLoggingServiceAbstraction } from "@bitwarden/common/src/abstractions/event.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/src/abstractions/i18n.service";
import { NotificationsService as NotificationsServiceAbstraction } from "@bitwarden/common/src/abstractions/notifications.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { StateService as StateServiceAbstraction } from "@bitwarden/common/src/abstractions/state.service";
import { TwoFactorService as TwoFactorServiceAbstraction } from "@bitwarden/common/src/abstractions/twoFactor.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "@bitwarden/common/src/abstractions/vaultTimeout.service";
import { ThemeType } from "@bitwarden/common/src/enums/themeType";
import { ContainerService } from "@bitwarden/common/src/services/container.service";
import { EventService as EventLoggingService } from "@bitwarden/common/src/services/event.service";
import { VaultTimeoutService as VaultTimeoutService } from "@bitwarden/common/src/services/vaultTimeout.service";

import { I18nService as I18nService } from "../../services/i18n.service";

@Injectable()
export class InitService {
  constructor(
    @Inject(WINDOW) private win: Window,
    private environmentService: EnvironmentServiceAbstraction,
    private notificationsService: NotificationsServiceAbstraction,
    private vaultTimeoutService: VaultTimeoutServiceAbstraction,
    private i18nService: I18nServiceAbstraction,
    private eventLoggingService: EventLoggingServiceAbstraction,
    private twoFactorService: TwoFactorServiceAbstraction,
    private stateService: StateServiceAbstraction,
    private platformUtilsService: PlatformUtilsServiceAbstraction,
    private cryptoService: CryptoServiceAbstraction
  ) {}

  init() {
    return async () => {
      await this.stateService.init();

      const urls = process.env.URLS as Urls;
      urls.base ??= this.win.location.origin;
      this.environmentService.setUrls(urls);

      setTimeout(() => this.notificationsService.init(), 3000);

      (this.vaultTimeoutService as VaultTimeoutService).init(true);
      const locale = await this.stateService.getLocale();
      await (this.i18nService as I18nService).init(locale);
      (this.eventLoggingService as EventLoggingService).init(true);
      this.twoFactorService.init();
      const htmlEl = this.win.document.documentElement;
      htmlEl.classList.add("locale_" + this.i18nService.translationLocale);

      // Initial theme is set in index.html which must be updated if there are any changes to theming logic
      this.platformUtilsService.onDefaultSystemThemeChange(async (sysTheme) => {
        const bwTheme = await this.stateService.getTheme();
        if (bwTheme === ThemeType.System) {
          htmlEl.classList.remove("theme_" + ThemeType.Light, "theme_" + ThemeType.Dark);
          htmlEl.classList.add("theme_" + sysTheme);
        }
      });

      const containerService = new ContainerService(this.cryptoService);
      containerService.attachToWindow(this.win);
    };
  }
}
