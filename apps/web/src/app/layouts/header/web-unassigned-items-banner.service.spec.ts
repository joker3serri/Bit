import { MockProxy, mock } from "jest-mock-extended";
import { firstValueFrom, skip } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { FakeStateProvider, mockAccountServiceWith } from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import {
  DISMISS_BANNER_KEY,
  HAS_UNASSIGNED_ITEMS,
  WebUnassignedItemsBannerService,
} from "./web-unassigned-items-banner.service";

describe("WebUnassignedItemsBanner", () => {
  let stateProvider: FakeStateProvider;
  let apiService: MockProxy<ApiService>;

  const sutFactory = () => new WebUnassignedItemsBannerService(stateProvider, apiService);

  beforeEach(() => {
    const fakeAccountService = mockAccountServiceWith("userId" as UserId);
    stateProvider = new FakeStateProvider(fakeAccountService);
    apiService = mock();
  });

  describe("given stored values only", () => {
    it("shows the banner if has unassigned ciphers and has not been dismissed", async () => {
      const dismissBanner = stateProvider.activeUser.getFake(DISMISS_BANNER_KEY);
      dismissBanner.nextState(undefined);
      const hasUnassignedItems = stateProvider.activeUser.getFake(HAS_UNASSIGNED_ITEMS);
      hasUnassignedItems.nextState(true);

      const sut = sutFactory();
      expect(await firstValueFrom(sut.showBanner$)).toBe(true);
      expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
    });

    it("does not show the banner if does not have unassigned ciphers", async () => {
      const dismissBanner = stateProvider.activeUser.getFake(DISMISS_BANNER_KEY);
      dismissBanner.nextState(undefined);
      const hasUnassignedItems = stateProvider.activeUser.getFake(HAS_UNASSIGNED_ITEMS);
      hasUnassignedItems.nextState(false);

      const sut = sutFactory();
      expect(await firstValueFrom(sut.showBanner$)).toBe(false);
      expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
    });

    it("does not show the banner if it has already been dismissed", async () => {
      const dismissBanner = stateProvider.activeUser.getFake(DISMISS_BANNER_KEY);
      dismissBanner.nextState(true);
      const hasUnassignedItems = stateProvider.activeUser.getFake(HAS_UNASSIGNED_ITEMS);
      hasUnassignedItems.nextState(true);

      const sut = sutFactory();
      expect(await firstValueFrom(sut.showBanner$)).toBe(false);
      expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
    });
  });

  it("fetches unassigned ciphers value from server", async () => {
    apiService.getShowUnassignedCiphersBanner.mockResolvedValue(true);

    const dismissBanner = stateProvider.activeUser.getFake(DISMISS_BANNER_KEY);
    dismissBanner.nextState(false);
    const hasUnassignedItems = stateProvider.activeUser.getFake(HAS_UNASSIGNED_ITEMS);
    hasUnassignedItems.nextState(null);

    const sut = sutFactory();
    // skip first value so we get the recomputed value after the server call
    expect(await firstValueFrom(sut.showBanner$.pipe(skip(1)))).toBe(true);
    // Expect to have updated local state
    expect(await firstValueFrom(hasUnassignedItems.state$)).toBe(true);
    expect(apiService.getShowUnassignedCiphersBanner).toHaveBeenCalledTimes(1);
  });
});
