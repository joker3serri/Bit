import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { CanActivateFn, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { mock, MockProxy } from "jest-mock-extended";

import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { I18nMockService } from "@bitwarden/components/src";

import { canAccessFeature } from "./feature-flag.guard";

@Component({ template: "" })
export class EmptyComponent {}

describe("canAccessFeature", () => {
  const testFlag: FeatureFlag = "test-flag" as FeatureFlag;
  const featureRoute = "enabled-feature";
  const redirectRoute = "redirect";
  const mockPlatformUtilsService: MockProxy<PlatformUtilsService> = mock<PlatformUtilsService>();

  let mockConfigService: MockProxy<ConfigServiceAbstraction>;

  const setup = (featureGuard: CanActivateFn) => {
    mockConfigService = mock<ConfigServiceAbstraction>();

    const testBed = TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: "", component: EmptyComponent },
          {
            path: featureRoute,
            component: EmptyComponent,
            canActivate: [featureGuard],
          },
          { path: redirectRoute, component: EmptyComponent },
        ]),
      ],
      providers: [
        { provide: ConfigServiceAbstraction, useValue: mockConfigService },
        { provide: PlatformUtilsService, useValue: mockPlatformUtilsService },
        {
          provide: I18nService,
          useValue: new I18nMockService({
            accessDenied: "Access Denied!",
          }),
        },
      ],
    });
    return {
      router: testBed.inject(Router),
    };
  };

  it("successfully navigates when the feature flag is enabled", async () => {
    const { router } = setup(canAccessFeature(testFlag));
    mockConfigService.getFeatureFlagBool.calledWith(testFlag).mockResolvedValue(true);

    await router.navigate([featureRoute]);

    expect(router.url).toBe(`/${featureRoute}`);
  });

  it("fails to navigate when the feature flag is disabled", async () => {
    const { router } = setup(canAccessFeature(testFlag));
    mockConfigService.getFeatureFlagBool.calledWith(testFlag).mockResolvedValue(false);

    await router.navigate([featureRoute]);

    expect(router.url).toBe("/");
  });

  it("shows an error toast when the feature flag is disabled", async () => {
    const { router } = setup(canAccessFeature(testFlag));
    mockConfigService.getFeatureFlagBool.calledWith(testFlag).mockResolvedValue(false);

    await router.navigate([featureRoute]);

    expect(mockPlatformUtilsService.showToast).toHaveBeenCalledWith(
      "error",
      null,
      expect.anything()
    );
  });

  it("redirects to the specified redirect url when the feature flag is disabled", async () => {
    const { router } = setup(canAccessFeature(testFlag, redirectRoute));
    mockConfigService.getFeatureFlagBool.calledWith(testFlag).mockResolvedValue(false);

    await router.navigate([featureRoute]);

    expect(router.url).toBe(`/${redirectRoute}`);
  });
});
