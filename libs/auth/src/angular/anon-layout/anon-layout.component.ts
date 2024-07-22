import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { ClientType } from "@bitwarden/common/enums";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ThemeStateService } from "@bitwarden/common/platform/theming/theme-state.service";

import { IconModule, Icon } from "../../../../components/src/icon";
import { SharedModule } from "../../../../components/src/shared";
import { TypographyModule } from "../../../../components/src/typography";
import { BitwardenLogoPrimary, BitwardenLogoWhite, UserIcon } from "../icons";

@Component({
  standalone: true,
  selector: "auth-anon-layout",
  templateUrl: "./anon-layout.component.html",
  imports: [IconModule, CommonModule, TypographyModule, SharedModule],
})
export class AnonLayoutComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() icon: Icon = UserIcon;
  @Input() showReadonlyHostname: boolean;
  @Input() hideLogo: boolean = false;

  protected logo: Icon;

  protected year = "2024";
  protected clientType: ClientType;
  protected hostname: string;
  protected version: string;
  protected theme: string;

  protected hideFooter = false;
  protected hideYearAndVersion = false;

  constructor(
    private environmentService: EnvironmentService,
    private platformUtilsService: PlatformUtilsService,
    private themeStateService: ThemeStateService,
  ) {
    this.year = new Date().getFullYear().toString();
    this.clientType = this.platformUtilsService.getClientType();
    this.hideFooter = this.clientType === ClientType.Browser;
    this.hideYearAndVersion = this.clientType !== ClientType.Web;
  }

  async ngOnInit() {
    this.theme = await firstValueFrom(this.themeStateService.selectedTheme$);

    if (this.theme === "dark") {
      this.logo = BitwardenLogoWhite;
    } else {
      this.logo = BitwardenLogoPrimary;
    }

    this.hostname = (await firstValueFrom(this.environmentService.environment$)).getHostname();
    this.version = await this.platformUtilsService.getApplicationVersion();
  }
}
