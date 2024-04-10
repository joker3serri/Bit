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
    deserializer: (b) => b ?? false,
  },
);

const HAS_UNASSIGNED_ITEMS = new KeyDefinition<boolean | null>(
  UNASSIGNED_ITEMS_BANNER_DISK,
  "hasUnassignedItems",
  {
    deserializer: (b) => b ?? null,
  },
);

/** Displays a banner that tells users how to move their unassigned items into a collection. */
@Injectable({ providedIn: "root" })
export class WebUnassignedItemsBannerService {
  private _hasUnassignedItems = this.globalStateProvider.get(DISMISS_BANNER_KEY);
  private _showBanner = this.globalStateProvider.get(HAS_UNASSIGNED_ITEMS);

  showBanner$ = combineLatest([this._hasUnassignedItems.state$, this._showBanner.state$]).pipe(
    concatMap(async ([dismissBanner, hasUnassignedItems]) => {
      if (!dismissBanner && hasUnassignedItems == null) {
        const hasUnassignedItemsResponse = await this.apiService.getShowUnassignedCiphersBanner();
        await this._showBanner.update(() => hasUnassignedItemsResponse);
        return EMPTY; // to test, we could also just emit false and let the value update the next time around
      }

      return !dismissBanner && hasUnassignedItems;
    }),
  );

  constructor(
    private globalStateProvider: GlobalStateProvider,
    private apiService: ApiService,
  ) {}

  async hideBanner() {
    await this._hasUnassignedItems.update(() => true);
  }
}
