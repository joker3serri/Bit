import { Directive, EventEmitter, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";

import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { TwoFactorService } from "@bitwarden/common/src/abstractions/twoFactor.service";
import { TwoFactorProviderType } from "@bitwarden/common/src/enums/twoFactorProviderType";

@Directive()
export class TwoFactorOptionsComponent implements OnInit {
  @Output() onProviderSelected = new EventEmitter<TwoFactorProviderType>();
  @Output() onRecoverSelected = new EventEmitter();

  providers: any[] = [];

  constructor(
    protected twoFactorService: TwoFactorService,
    protected router: Router,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected win: Window
  ) {}

  ngOnInit() {
    this.providers = this.twoFactorService.getSupportedProviders(this.win);
  }

  choose(p: any) {
    this.onProviderSelected.emit(p.type);
  }

  recover() {
    this.platformUtilsService.launchUri("https://bitwarden.com/help/lost-two-step-device/");
    this.onRecoverSelected.emit();
  }
}
