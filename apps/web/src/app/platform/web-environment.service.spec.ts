import { Router } from "@angular/router";
import { mock, MockProxy } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { Region, Urls } from "@bitwarden/common/platform/abstractions/environment.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { PRODUCTION_REGIONS } from "@bitwarden/common/platform/services/default-environment.service";
import {
  FakeAccountService,
  FakeStateProvider,
  mockAccountServiceWith,
} from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import { WebCloudEnvironment, WebEnvironmentService } from "./web-environment.service";

describe("WebEnvironmentService", () => {
  let service: WebEnvironmentService;

  let window: MockProxy<Window>;

  let stateProvider: FakeStateProvider;
  let accountService: FakeAccountService;
  let router: MockProxy<Router>;

  const mockUserId = Utils.newGuid() as UserId;

  describe("Production", () => {
    describe("US Environment", () => {
      const mockInitialProdUSUrls = {
        base: null,
        api: "https://api.bitwarden.com",
        identity: "https://identity.bitwarden.com",
        icons: "https://icons.bitwarden.net",
        webVault: "https://vault.bitwarden.com",
        notifications: "https://notifications.bitwarden.com",
        events: "https://events.bitwarden.com",
        scim: "https://scim.bitwarden.com",
      } as Urls;

      const mockProdUSBaseUrl = "https://vault.bitwarden.com";

      const expectedProdUSUrls: Urls = {
        ...mockInitialProdUSUrls,
        base: mockProdUSBaseUrl,
      };

      const expectedModifiedScimUrl = expectedProdUSUrls.scim + "/v2";
      const expectedSendUrl = "https://send.bitwarden.com/#";

      const PROD_US_REGION = PRODUCTION_REGIONS.find((r) => r.key === Region.US);

      const prodUSEnv = new WebCloudEnvironment(PROD_US_REGION, expectedProdUSUrls);

      beforeEach(() => {
        window = mock<Window>();

        window.location = {
          origin: mockProdUSBaseUrl,
          href: mockProdUSBaseUrl + "/#/example",
        } as Location;

        accountService = mockAccountServiceWith(mockUserId);
        stateProvider = new FakeStateProvider(accountService);
        router = mock<Router>();

        (router as any).url = "";

        service = new WebEnvironmentService(
          window,
          stateProvider,
          accountService,
          router,
          mockInitialProdUSUrls,
        );
      });

      it("initializes the environment with the US production urls", async () => {
        const env = await firstValueFrom(service.environment$);

        expect(env).toEqual(prodUSEnv);

        expect(env.getRegion()).toEqual(Region.US);
        expect(env.getUrls()).toEqual(expectedProdUSUrls);
        expect(env.isCloud()).toBeTruthy();

        expect(env.getApiUrl()).toEqual(expectedProdUSUrls.api);
        expect(env.getIdentityUrl()).toEqual(expectedProdUSUrls.identity);
        expect(env.getIconsUrl()).toEqual(expectedProdUSUrls.icons);
        expect(env.getWebVaultUrl()).toEqual(expectedProdUSUrls.webVault);
        expect(env.getNotificationsUrl()).toEqual(expectedProdUSUrls.notifications);
        expect(env.getEventsUrl()).toEqual(expectedProdUSUrls.events);

        expect(env.getScimUrl()).toEqual(expectedModifiedScimUrl);
        expect(env.getSendUrl()).toEqual(expectedSendUrl);

        expect(env.getHostname()).toEqual(PROD_US_REGION.domain);
      });

      describe("setEnvironment", () => {
        it("throws an error when trying to set the environment to self-hosted", async () => {
          await expect(service.setEnvironment(Region.SelfHosted)).rejects.toThrow(
            "setEnvironment does not work in web for self-hosted.",
          );
        });

        it("only returns the current env's urls when trying to set the environment to the current region", async () => {
          const urls = await service.setEnvironment(Region.US);
          expect(urls).toEqual(expectedProdUSUrls);
        });

        it("errors if the selected region is unknown", async () => {
          await expect(service.setEnvironment("unknown" as Region)).rejects.toThrow(
            "The selected region is not known as an available region.",
          );
        });

        it("sets the window location to a new region's web vault url and preserves any query params", async () => {
          const routeAndQueryParams = "/signup?example=1&another=2";
          (router as any).url = routeAndQueryParams;

          const newRegion = Region.EU;
          const newRegionConfig = PRODUCTION_REGIONS.find((r) => r.key === newRegion);

          await service.setEnvironment(newRegion);

          expect(window.location.href).toEqual(
            newRegionConfig.urls.webVault + "/#" + routeAndQueryParams,
          );
        });
      });
    });

    describe("EU Environment", () => {
      const mockInitialProdEUUrls = {
        base: null,
        api: "https://api.bitwarden.eu",
        identity: "https://identity.bitwarden.eu",
        icons: "https://icons.bitwarden.eu",
        webVault: "https://vault.bitwarden.eu",
        notifications: "https://notifications.bitwarden.eu",
        events: "https://events.bitwarden.eu",
        scim: "https://scim.bitwarden.eu",
      } as Urls;

      const mockProdEUBaseUrl = "https://vault.bitwarden.eu";

      const expectedProdEUUrls: Urls = {
        ...mockInitialProdEUUrls,
        base: mockProdEUBaseUrl,
      };

      const expectedModifiedScimUrl = expectedProdEUUrls.scim + "/v2";
      const expectedSendUrl = expectedProdEUUrls.webVault + "/#/send/";

      const prodEURegionConfig = PRODUCTION_REGIONS.find((r) => r.key === Region.EU);

      const prodEUEnv = new WebCloudEnvironment(prodEURegionConfig, expectedProdEUUrls);

      beforeEach(() => {
        window = mock<Window>();

        window.location = {
          origin: mockProdEUBaseUrl,
          href: mockProdEUBaseUrl + "/#/example",
        } as Location;

        accountService = mockAccountServiceWith(mockUserId);
        stateProvider = new FakeStateProvider(accountService);
        router = mock<Router>();

        service = new WebEnvironmentService(
          window,
          stateProvider,
          accountService,
          router,
          mockInitialProdEUUrls,
        );
      });

      it("initializes the environment to be the prod EU environment", async () => {
        const env = await firstValueFrom(service.environment$);

        expect(env).toEqual(prodEUEnv);
        expect(env.getRegion()).toEqual(Region.EU);
        expect(env.getUrls()).toEqual(expectedProdEUUrls);
        expect(env.isCloud()).toBeTruthy();

        expect(env.getApiUrl()).toEqual(expectedProdEUUrls.api);
        expect(env.getIdentityUrl()).toEqual(expectedProdEUUrls.identity);
        expect(env.getIconsUrl()).toEqual(expectedProdEUUrls.icons);
        expect(env.getWebVaultUrl()).toEqual(expectedProdEUUrls.webVault);
        expect(env.getNotificationsUrl()).toEqual(expectedProdEUUrls.notifications);
        expect(env.getEventsUrl()).toEqual(expectedProdEUUrls.events);

        expect(env.getScimUrl()).toEqual(expectedModifiedScimUrl);
        expect(env.getSendUrl()).toEqual(expectedSendUrl);

        expect(env.getHostname()).toEqual(prodEURegionConfig.domain);
      });

      describe("setEnvironment", () => {
        it("throws an error when trying to set the environment to self-hosted", async () => {
          await expect(service.setEnvironment(Region.SelfHosted)).rejects.toThrow(
            "setEnvironment does not work in web for self-hosted.",
          );
        });

        it("only returns the current env's urls when trying to set the environment to the current region", async () => {
          const urls = await service.setEnvironment(Region.EU);
          expect(urls).toEqual(expectedProdEUUrls);
        });

        it("errors if the selected region is unknown", async () => {
          await expect(service.setEnvironment("unknown" as Region)).rejects.toThrow(
            "The selected region is not known as an available region.",
          );
        });

        it("sets the window location to a new region's web vault url and preserves any query params", async () => {
          const routeAndQueryParams = "/signup?example=1&another=2";
          (router as any).url = routeAndQueryParams;

          const newRegion = Region.US;
          const newRegionConfig = PRODUCTION_REGIONS.find((r) => r.key === newRegion);

          await service.setEnvironment(newRegion);

          expect(window.location.href).toEqual(
            newRegionConfig.urls.webVault + "/#" + routeAndQueryParams,
          );
        });
      });
    });
  });

  describe("QA", () => {
    // describe("US QA", () => {
    //   const mockInitialQAUSUrls = {
    //     base: null,
    //     api: "https://api.bitwarden.com",
    //     identity: "https://identity.bitwarden.com",
    //     icons: "https://icons.bitwarden.net",
    //     webVault: "https://vault.bitwarden.com",
    //     notifications: "https://notifications.bitwarden.com",
    //     events: "https://events.bitwarden.com",
    //     scim: "https://scim.bitwarden.com",
    //   } as Urls;
    //   const mockProdUSBaseUrl = "https://vault.bitwarden.com";
    //   const expectedProdUSUrls: Urls = {
    //     ...mockInitialProdUSUrls,
    //     base: mockProdUSBaseUrl,
    //   };
    //   const expectedModifiedScimUrl = expectedProdUSUrls.scim + "/v2";
    //   const expectedSendUrl = "https://send.bitwarden.com/#";
    //   const PROD_US_REGION = PRODUCTION_REGIONS.find((r) => r.key === Region.US);
    //   const prodUSEnv = new WebCloudEnvironment(PROD_US_REGION, expectedProdUSUrls);
    //   beforeEach(() => {
    //     process.env.URLS = JSON.stringify(mockInitialProdUSUrls);
    //     window = mock<Window>();
    //     window.location = {
    //       origin: mockProdUSBaseUrl,
    //       href: mockProdUSBaseUrl + "/#/example",
    //     } as Location;
    //     accountService = mockAccountServiceWith(mockUserId);
    //     stateProvider = new FakeStateProvider(accountService);
    //     router = mock<Router>();
    //     (router as any).url = "";
    //     service = new WebEnvironmentService(window, stateProvider, accountService, router);
    //   });
    // })
  });
});
