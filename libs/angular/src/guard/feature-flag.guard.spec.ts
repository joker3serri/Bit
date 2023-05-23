import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { CanActivateFn, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { ServerConfig } from "@bitwarden/common/abstractions/config/server-config";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ServerConfigData } from "@bitwarden/common/models/data/server-config.data";
import { I18nMockService } from "@bitwarden/components/src";

import { canAccessFeature } from "./feature-flag.guard";

@Component({ template: "" })
export class EmptyComponent {}

describe("canAccessFeature", () => {
  const testFlag: FeatureFlag = "test-flag" as FeatureFlag;
  const featureRoute = "enabled-feature";
  const redirectRoute = "redirect";

  let mockConfigService: MockProxy<ConfigServiceAbstraction>;
  let mockPlatformUtilsService: MockProxy<PlatformUtilsService>;

  const setup = (featureGuard: CanActivateFn, flagValue: any) => {
    mockConfigService = mock<ConfigServiceAbstraction>();
    mockPlatformUtilsService = mock<PlatformUtilsService>();

    mockConfigService.serverConfig$ = new BehaviorSubject(
      new ServerConfig({
        featureStates: {
          [testFlag]: flagValue,
        },
      } as ServerConfigData)
    );

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
        { provide: LogService, useValue: mock<LogService>() },
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
    const { router } = setup(canAccessFeature(testFlag), true);

    await router.navigate([featureRoute]);

    expect(router.url).toBe(`/${featureRoute}`);
  });

  it("successfully navigates when the feature flag value matches the required value", async () => {
    const { router } = setup(canAccessFeature(testFlag, "some-value"), "some-value");

    await router.navigate([featureRoute]);

    expect(router.url).toBe(`/${featureRoute}`);
  });

  it("fails to navigate when the feature flag is disabled", async () => {
    const { router } = setup(canAccessFeature(testFlag), false);

    await router.navigate([featureRoute]);

    expect(router.url).toBe("/");
  });

  it("fails to navigate when the feature flag value does not match the required value", async () => {
    const { router } = setup(canAccessFeature(testFlag, "some-value"), "some-wrong-value");

    await router.navigate([featureRoute]);

    expect(router.url).toBe("/");
  });

  it("shows an error toast when the feature flag is disabled", async () => {
    const { router } = setup(canAccessFeature(testFlag), false);

    await router.navigate([featureRoute]);

    expect(mockPlatformUtilsService.showToast).toHaveBeenCalledWith(
      "error",
      null,
      "Access Denied!"
    );
  });

  it("does not show an error toast when the feature flag is enabled", async () => {
    const { router } = setup(canAccessFeature(testFlag), true);

    await router.navigate([featureRoute]);

    expect(mockPlatformUtilsService.showToast).not.toHaveBeenCalled();
  });

  it("redirects to the specified redirect url when the feature flag is disabled", async () => {
    const { router } = setup(canAccessFeature(testFlag, true, redirectRoute), false);

    await router.navigate([featureRoute]);

    expect(router.url).toBe(`/${redirectRoute}`);
  });

  it("successfully navigates when the observable throws an unexpected exception", async () => {
    const { router } = setup(canAccessFeature(testFlag), true);

    // Supplying a null config cause the observable to throw an exception
    mockConfigService.serverConfig$ = new BehaviorSubject(null);

    await router.navigate([featureRoute]);

    expect(router.url).toBe(`/${featureRoute}`);
  });
});
