import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Observable } from "rxjs";

import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutAction } from "@bitwarden/common/enums/vault-timeout-action.enum";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { AccountProfile } from "@bitwarden/common/platform/models/domain/account";
import {
  GlobalStateProvider,
  KeyDefinition,
  NEW_WEB_LAYOUT_BANNER_DISK,
} from "@bitwarden/common/platform/state";

import { StateService } from "../../core/state/state.service";

const SHOW_BANNER_KEY = new KeyDefinition<boolean>(NEW_WEB_LAYOUT_BANNER_DISK, "showBanner", {
  deserializer: (b) => {
    if (b === null) {
      return true;
    }
    return b;
  },
});

@Component({
  selector: "app-header",
  templateUrl: "./web-header.component.html",
})
export class WebHeaderComponent {
  /**
   * Custom title that overrides the route data `titleId`
   */
  @Input() title: string;

  /**
   * Icon to show before the title
   */
  @Input() icon: string;

  protected routeData$: Observable<{ titleId: string }>;
  protected account$: Observable<AccountProfile>;
  protected canLock$: Observable<boolean>;
  protected selfHosted: boolean;
  protected hostname = location.hostname;

  private showBannerState = this.globalStateProvider.get(SHOW_BANNER_KEY);
  protected showBanner$ = this.showBannerState.state$;

  constructor(
    private route: ActivatedRoute,
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private messagingService: MessagingService,
    private globalStateProvider: GlobalStateProvider,
  ) {
    this.routeData$ = this.route.data.pipe(
      map((params) => {
        return {
          titleId: params.titleId,
        };
      }),
    );

    this.selfHosted = this.platformUtilsService.isSelfHost();

    this.account$ = combineLatest([
      this.stateService.activeAccount$,
      this.stateService.accounts$,
    ]).pipe(
      map(([activeAccount, accounts]) => {
        return accounts[activeAccount]?.profile;
      }),
    );
    this.canLock$ = this.vaultTimeoutSettingsService
      .availableVaultTimeoutActions$()
      .pipe(map((actions) => actions.includes(VaultTimeoutAction.Lock)));
  }

  protected lock() {
    this.messagingService.send("lockVault");
  }

  protected logout() {
    this.messagingService.send("logout");
  }

  protected async hideBanner() {
    await this.showBannerState.update(() => false);
  }
}
