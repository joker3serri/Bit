import { Injectable } from "@angular/core";
import { EMPTY, combineLatest, concatMap } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import {
  GlobalStateProvider,
  KeyDefinition,
  UNASSIGNED_ITEMS_BANNER_DISK,
} from "@bitwarden/common/platform/state";

const DISMISS_BANNER_KEY = new KeyDefinition<boolean>(
  UNASSIGNED_ITEMS_BANNER_DISK,
  "dismissBanner",
  {
    deserializer: (b) => {
      if (b === null) {
        return false;
      }
      return b;
    },
  },
);

const SHOW_BANNER_KEY = new KeyDefinition<boolean | null>(
  UNASSIGNED_ITEMS_BANNER_DISK,
  "showBanner",
  {
    deserializer: (b) => b ?? null,
  },
);

/** Displays a banner that tells users how to move their unassigned items into a collection. */
@Injectable({ providedIn: "root" })
export class WebUnassignedItemsBannerService {
  private _dismissBannerState = this.globalStateProvider.get(DISMISS_BANNER_KEY);
  private _showBannerState = this.globalStateProvider.get(SHOW_BANNER_KEY);

  showBanner$ = combineLatest([this._dismissBannerState.state$, this._showBannerState.state$]).pipe(
    concatMap(async ([dismissBanner, showBanner]) => {
      if (!dismissBanner && showBanner == null) {
        const showBannerResponse = await this.apiService.getShowUnassignedCiphersBanner();
        await this._showBannerState.update(() => showBannerResponse);
        return EMPTY; // to test, we could also just emit false and let the value update the next time around
      }

      return !dismissBanner && showBanner;
    }),
  );

  constructor(
    private globalStateProvider: GlobalStateProvider,
    private apiService: ApiService,
  ) {}

  async hideBanner() {
    await this._dismissBannerState.update(() => true);
  }
}
