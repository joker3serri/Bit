import { MockProxy, mock } from "jest-mock-extended";
import { firstValueFrom, take } from "rxjs";

import { FakeStateProvider, mockAccountServiceWith } from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import { UnassignedItemsBannerApiService } from "./unassigned-items-banner.api.service";
import { SHOW_BANNER_KEY, UnassignedItemsBannerService } from "./unassigned-items-banner.service";

describe("UnassignedItemsBanner", () => {
  let stateProvider: FakeStateProvider;
  let apiService: MockProxy<UnassignedItemsBannerApiService>;

  const sutFactory = () => new UnassignedItemsBannerService(stateProvider, apiService);

  beforeEach(() => {
    const fakeAccountService = mockAccountServiceWith("userId" as UserId);
    stateProvider = new FakeStateProvider(fakeAccountService);
    apiService = mock();
  });

  it("shows the banner if showBanner local state is true", async () => {
    const showBanner = stateProvider.activeUser.getFake(SHOW_BANNER_KEY);
    showBanner.nextState(true);

    const sut = sutFactory();
    expect(await firstValueFrom(sut.showBanner$)).toBe(true);
    expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
  });

  it("does not show the banner if showBanner local state is false", async () => {
    const showBanner = stateProvider.activeUser.getFake(SHOW_BANNER_KEY);
    showBanner.nextState(false);

    const sut = sutFactory();
    expect(await firstValueFrom(sut.showBanner$)).toBe(false);
    expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
  });

  it("fetches from server if local state has not been set yet", (done) => {
    apiService.getShowUnassignedCiphersBanner.mockResolvedValue(true);

    const showBanner = stateProvider.activeUser.getFake(SHOW_BANNER_KEY);
    showBanner.nextState(undefined);

    const sut = sutFactory();

    let count = 1;
    sut.showBanner$.pipe(take(2)).subscribe((val) => {
      if (count == 1) {
        // Should continue to hide the banner while we wait for the server response
        expect(val).toBe(false);
        count++;
      } else {
        // Then use the server response
        expect(val).toBe(true);
        expect(apiService.getShowUnassignedCiphersBanner).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });
});
