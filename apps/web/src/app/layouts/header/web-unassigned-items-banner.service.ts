import { Injectable } from "@angular/core";
import { EMPTY, combineLatest, concatMap } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import {
  StateProvider,
  UNASSIGNED_ITEMS_BANNER_DISK,
  UserKeyDefinition,
} from "@bitwarden/common/platform/state";

const DISMISS_BANNER_KEY = new UserKeyDefinition<boolean>(
  UNASSIGNED_ITEMS_BANNER_DISK,
  "dismissBanner",
  {
    deserializer: (b) => b ?? false,
    clearOn: ["logout"],
  },
);

const HAS_UNASSIGNED_ITEMS = new UserKeyDefinition<boolean | null>(
  UNASSIGNED_ITEMS_BANNER_DISK,
  "hasUnassignedItems",
  {
    deserializer: (b) => b ?? null,
    clearOn: ["logout"],
  },
);

/** Displays a banner that tells users how to move their unassigned items into a collection. */
@Injectable({ providedIn: "root" })
export class WebUnassignedItemsBannerService {
  private _hasUnassignedItems = this.stateProvider.getActive(DISMISS_BANNER_KEY);
  private _showBanner = this.stateProvider.getActive(HAS_UNASSIGNED_ITEMS);

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
    private stateProvider: StateProvider,
    private apiService: ApiService,
  ) {}

  async hideBanner() {
    await this._hasUnassignedItems.update(() => true);
  }
}
