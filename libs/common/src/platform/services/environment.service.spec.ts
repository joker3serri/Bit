import { firstValueFrom } from "rxjs";

import { FakeStateProvider, awaitAsync } from "../../../spec";
import { FakeAccountService } from "../../../spec/fake-account-service";
import { AuthenticationStatus } from "../../auth/enums/authentication-status";
import { UserId } from "../../types/guid";
import { Region } from "../abstractions/environment.service";

import { ENVIRONMENT_KEY, EnvironmentService, EnvironmentUrls } from "./environment.service";

// There are a few main states EnvironmentService could be in when first used
// 1. Not initialized, no active user. Hopefully not to likely but possible
// 2. Not initialized, with active user. Not likely
// 3. Initialized, no active user.
// 4. Initialized, with active user.
describe("EnvironmentService", () => {
  let accountService: FakeAccountService;
  let stateProvider: FakeStateProvider;

  let sut: EnvironmentService;

  const testUser = "00000000-0000-1000-a000-000000000001" as UserId;
  const alternateTestUser = "00000000-0000-1000-a000-000000000002" as UserId;

  beforeEach(async () => {
    accountService = new FakeAccountService({
      [testUser]: {
        name: "name",
        email: "email",
        status: AuthenticationStatus.Locked,
      },
      [alternateTestUser]: {
        name: "name",
        email: "email",
        status: AuthenticationStatus.Locked,
      },
    });
    stateProvider = new FakeStateProvider(accountService);

    sut = new EnvironmentService(stateProvider, accountService);
  });

  const switchUser = async (userId: UserId) => {
    accountService.activeAccountSubject.next({
      id: userId,
      email: "test@example.com",
      name: `Test Name ${userId}`,
      status: AuthenticationStatus.Unlocked,
    });
    await awaitAsync();
  };

  const setGlobalData = (region: Region, environmentUrls: EnvironmentUrls) => {
    stateProvider.global.getFake(ENVIRONMENT_KEY).stateSubject.next({
      region: region,
      urls: environmentUrls,
    });
  };

  const setUserData = (
    region: Region,
    environmentUrls: EnvironmentUrls,
    userId: UserId = testUser,
  ) => {
    stateProvider.singleUser.getFake(userId, ENVIRONMENT_KEY).nextState({
      region: region,
      urls: environmentUrls,
    });
  };
  // END: CAN CHANGE

  const initialize = async (options: { switchUser: boolean }) => {
    if (options.switchUser) {
      await switchUser(testUser);
    }
  };

  const REGION_SETUP = [
    {
      region: Region.US,
      expectedUrls: {
        webVault: "https://vault.bitwarden.com",
        identity: "https://identity.bitwarden.com",
        api: "https://api.bitwarden.com",
        icons: "https://icons.bitwarden.net",
        notifications: "https://notifications.bitwarden.com",
        events: "https://events.bitwarden.com",
        scim: "https://scim.bitwarden.com/v2",
        send: "https://send.bitwarden.com/#",
      },
    },
    {
      region: Region.EU,
      expectedUrls: {
        webVault: "https://vault.bitwarden.eu",
        identity: "https://identity.bitwarden.eu",
        api: "https://api.bitwarden.eu",
        icons: "https://icons.bitwarden.eu",
        notifications: "https://notifications.bitwarden.eu",
        events: "https://events.bitwarden.eu",
        scim: "https://scim.bitwarden.eu/v2",
        send: "https://vault.bitwarden.eu/#/send/",
      },
    },
  ];

  describe("with user", () => {
    it.each(REGION_SETUP)(
      "sets correct urls for each region %s",
      async ({ region, expectedUrls }) => {
        setUserData(region, new EnvironmentUrls());
        await switchUser(testUser);

        expect(sut.hasBaseUrl()).toBe(false);
        expect(sut.getWebVaultUrl()).toBe(expectedUrls.webVault);
        expect(sut.getIdentityUrl()).toBe(expectedUrls.identity);
        expect(sut.getApiUrl()).toBe(expectedUrls.api);
        expect(sut.getIconsUrl()).toBe(expectedUrls.icons);
        expect(sut.getNotificationsUrl()).toBe(expectedUrls.notifications);
        expect(sut.getEventsUrl()).toBe(expectedUrls.events);
        expect(sut.getScimUrl()).toBe(expectedUrls.scim);
        expect(sut.getSendUrl()).toBe(expectedUrls.send);
        expect(sut.getKeyConnectorUrl()).toBe(undefined);
        expect(sut.isCloud()).toBe(true);
        expect(sut.getUrls()).toEqual({
          base: null,
          cloudWebVault: undefined,
          webVault: expectedUrls.webVault,
          identity: expectedUrls.identity,
          api: expectedUrls.api,
          icons: expectedUrls.icons,
          notifications: expectedUrls.notifications,
          events: expectedUrls.events,
          scim: expectedUrls.scim.replace("/v2", ""),
          keyConnector: undefined,
        });
      },
    );

    it("returns user data", async () => {
      const globalEnvironmentUrls = new EnvironmentUrls();
      globalEnvironmentUrls.base = "https://global-url.example.com";
      setGlobalData(Region.SelfHosted, globalEnvironmentUrls);

      const userEnvironmentUrls = new EnvironmentUrls();
      userEnvironmentUrls.base = "https://user-url.example.com";
      setUserData(Region.SelfHosted, userEnvironmentUrls);

      await initialize({ switchUser: true });

      expect(sut.getWebVaultUrl()).toBe("https://user-url.example.com");
      expect(sut.getIdentityUrl()).toBe("https://user-url.example.com/identity");
      expect(sut.getApiUrl()).toBe("https://user-url.example.com/api");
      expect(sut.getIconsUrl()).toBe("https://user-url.example.com/icons");
      expect(sut.getNotificationsUrl()).toBe("https://user-url.example.com/notifications");
      expect(sut.getEventsUrl()).toBe("https://user-url.example.com/events");
      expect(sut.getScimUrl()).toBe("https://user-url.example.com/scim/v2");
      expect(sut.getSendUrl()).toBe("https://user-url.example.com/#/send/");
      expect(sut.isCloud()).toBe(false);
      expect(sut.getUrls()).toEqual({
        base: "https://user-url.example.com",
        api: null,
        cloudWebVault: undefined,
        events: null,
        icons: null,
        identity: null,
        keyConnector: null,
        notifications: null,
        scim: null,
        webVault: null,
      });
    });
  });

  describe("without user", () => {
    it.each(REGION_SETUP)("gets default urls %s", async ({ region, expectedUrls }) => {
      await stateProvider.global.getFake(ENVIRONMENT_KEY).stateSubject.next({
        region: region,
        urls: new EnvironmentUrls(),
      });

      expect(sut.hasBaseUrl()).toBe(false);
      expect(sut.getWebVaultUrl()).toBe(expectedUrls.webVault);
      expect(sut.getIdentityUrl()).toBe(expectedUrls.identity);
      expect(sut.getApiUrl()).toBe(expectedUrls.api);
      expect(sut.getIconsUrl()).toBe(expectedUrls.icons);
      expect(sut.getNotificationsUrl()).toBe(expectedUrls.notifications);
      expect(sut.getEventsUrl()).toBe(expectedUrls.events);
      expect(sut.getScimUrl()).toBe(expectedUrls.scim);
      expect(sut.getSendUrl()).toBe(expectedUrls.send);
      expect(sut.getKeyConnectorUrl()).toBe(undefined);
      expect(sut.isCloud()).toBe(true);
      expect(sut.getUrls()).toEqual({
        base: null,
        cloudWebVault: undefined,
        webVault: expectedUrls.webVault,
        identity: expectedUrls.identity,
        api: expectedUrls.api,
        icons: expectedUrls.icons,
        notifications: expectedUrls.notifications,
        events: expectedUrls.events,
        scim: expectedUrls.scim.replace("/v2", ""),
        keyConnector: undefined,
      });
    });
  });

  it("returns US defaults when not initialized", async () => {
    setGlobalData(Region.EU, new EnvironmentUrls());
    setUserData(Region.EU, new EnvironmentUrls());

    expect(sut.initialized).toBe(false);

    expect(sut.hasBaseUrl()).toBe(false);
    expect(sut.getWebVaultUrl()).toBe("https://vault.bitwarden.com");
    expect(sut.getIdentityUrl()).toBe("https://identity.bitwarden.com");
    expect(sut.getApiUrl()).toBe("https://api.bitwarden.com");
    expect(sut.getIconsUrl()).toBe("https://icons.bitwarden.net");
    expect(sut.getNotificationsUrl()).toBe("https://notifications.bitwarden.com");
    expect(sut.getEventsUrl()).toBe("https://events.bitwarden.com");
    expect(sut.getScimUrl()).toBe("https://scim.bitwarden.com/v2");
    expect(sut.getKeyConnectorUrl()).toBe(undefined);
    expect(sut.isCloud()).toBe(true);
  });

  describe("setEnvironment", () => {
    it("self-hosted with base-url", async () => {
      await sut.setEnvironment(Region.SelfHosted, {
        base: "base.example.com",
      });
      await awaitAsync();

      const data = await firstValueFrom(sut.environment$);

      expect(data.getRegion()).toBe(Region.SelfHosted);
      expect(data.getUrls()).toEqual({
        base: "https://base.example.com",
        api: null,
        identity: null,
        webVault: null,
        icons: null,
        notifications: null,
        scim: null,
        events: null,
        keyConnector: null,
      });
    });

    it("self-hosted and sets all urls", async () => {
      expect(sut.getScimUrl()).toBe("https://scim.bitwarden.com/v2");

      await sut.setEnvironment(Region.SelfHosted, {
        base: "base.example.com",
        api: "api.example.com",
        identity: "identity.example.com",
        webVault: "vault.example.com",
        icons: "icons.example.com",
        notifications: "notifications.example.com",
        scim: "scim.example.com",
      });

      const data = await firstValueFrom(sut.environment$);

      expect(data.getRegion()).toBe(Region.SelfHosted);
      expect(data.getUrls()).toEqual({
        base: "https://base.example.com",
        api: "https://api.example.com",
        identity: "https://identity.example.com",
        webVault: "https://vault.example.com",
        icons: "https://icons.example.com",
        notifications: "https://notifications.example.com",
        scim: null,
        events: null,
        keyConnector: null,
      });
      expect(sut.getScimUrl()).toBe("https://vault.example.com/scim/v2");
    });

    it("sets the region", async () => {
      await sut.setEnvironment(Region.US);

      const data = await firstValueFrom(sut.environment$);

      expect(data.getRegion()).toBe(Region.US);
    });
  });

  describe("getHost", () => {
    it.each([
      { region: Region.US, expectedHost: "bitwarden.com" },
      { region: Region.EU, expectedHost: "bitwarden.eu" },
    ])("gets it from user data if there is an active user", async ({ region, expectedHost }) => {
      stateProvider.global.getFake(ENVIRONMENT_KEY).stateSubject.next({
        region: Region.US,
        urls: new EnvironmentUrls(),
      });
      await switchUser(testUser);
      stateProvider.singleUser.getFake(testUser, ENVIRONMENT_KEY).nextState({
        region: region,
        urls: new EnvironmentUrls(),
      });

      const host = await sut.getHost();
      expect(host).toBe(expectedHost);
    });

    it.each([
      { region: Region.US, expectedHost: "bitwarden.com" },
      { region: Region.EU, expectedHost: "bitwarden.eu" },
    ])("gets it from global data if there is no active user", async ({ region, expectedHost }) => {
      stateProvider.global.getFake(ENVIRONMENT_KEY).stateSubject.next({
        region: region,
        urls: new EnvironmentUrls(),
      });
      stateProvider.singleUser.getFake(testUser, ENVIRONMENT_KEY).nextState({
        region: Region.US,
        urls: new EnvironmentUrls(),
      });

      const host = await sut.getHost();
      expect(host).toBe(expectedHost);
    });

    it.each([
      { region: Region.US, expectedHost: "bitwarden.com" },
      { region: Region.EU, expectedHost: "bitwarden.eu" },
    ])(
      "gets it from global state if there is no active user even if a user id is passed in.",
      async ({ region, expectedHost }) => {
        setGlobalData(region, new EnvironmentUrls());
        setUserData(Region.US, new EnvironmentUrls());

        await initialize({ switchUser: false });

        const host = await sut.getHost(testUser);
        expect(host).toBe(expectedHost);
      },
    );

    it.each([
      { region: Region.US, expectedHost: "bitwarden.com" },
      { region: Region.EU, expectedHost: "bitwarden.eu" },
    ])(
      "gets it from the passed in userId if there is any active user: %s",
      async ({ region, expectedHost }) => {
        setGlobalData(Region.US, new EnvironmentUrls());
        setUserData(Region.US, new EnvironmentUrls());
        setUserData(region, new EnvironmentUrls(), alternateTestUser);

        await initialize({ switchUser: true });

        const host = await sut.getHost(alternateTestUser);
        expect(host).toBe(expectedHost);
      },
    );

    it("gets it from base url saved in self host config", async () => {
      const globalSelfHostUrls = new EnvironmentUrls();
      globalSelfHostUrls.base = "https://base.example.com";
      setGlobalData(Region.SelfHosted, globalSelfHostUrls);
      setUserData(Region.EU, new EnvironmentUrls());

      await initialize({ switchUser: false });

      const host = await sut.getHost();
      expect(host).toBe("base.example.com");
    });

    it("gets it from webVault url saved in self host config", async () => {
      const globalSelfHostUrls = new EnvironmentUrls();
      globalSelfHostUrls.webVault = "https://vault.example.com";
      globalSelfHostUrls.base = "https://base.example.com";
      setGlobalData(Region.SelfHosted, globalSelfHostUrls);
      setUserData(Region.EU, new EnvironmentUrls());

      await initialize({ switchUser: false });

      const host = await sut.getHost();
      expect(host).toBe("vault.example.com");
    });

    it("gets it from saved self host config from passed in user when there is an active user", async () => {
      setGlobalData(Region.US, new EnvironmentUrls());
      setUserData(Region.EU, new EnvironmentUrls());

      const selfHostUserUrls = new EnvironmentUrls();
      selfHostUserUrls.base = "https://base.example.com";
      setUserData(Region.SelfHosted, selfHostUserUrls, alternateTestUser);

      await initialize({ switchUser: true });

      const host = await sut.getHost(alternateTestUser);
      expect(host).toBe("base.example.com");
    });
  });

  describe("setUrlsFromStorage", () => {
    it("will set the global data to Region US if no existing data", async () => {
      await sut.setUrlsFromStorage();

      expect(sut.getWebVaultUrl()).toBe("https://vault.bitwarden.com");

      const data = await firstValueFrom(sut.environment$);
      expect(data.getRegion()).toBe(Region.US);
    });

    it("will set the urls to whatever is in global", async () => {
      setGlobalData(Region.EU, new EnvironmentUrls());

      await sut.setUrlsFromStorage();

      expect(sut.getWebVaultUrl()).toBe("https://vault.bitwarden.eu");
    });

    it("will get urls from signed in user", async () => {
      await switchUser(testUser);

      const userUrls = new EnvironmentUrls();
      userUrls.base = "base.example.com";
      await setUserData(Region.SelfHosted, userUrls);

      expect(sut.getWebVaultUrl()).toBe("base.example.com");
    });
  });

  describe("getCloudWebVaultUrl", () => {
    it("no extra initialization, returns US vault", () => {
      expect(sut.getCloudWebVaultUrl()).toBe("https://vault.bitwarden.com");
    });

    it.each([
      { region: Region.US, expectedVault: "https://vault.bitwarden.com" },
      { region: Region.EU, expectedVault: "https://vault.bitwarden.eu" },
      { region: Region.SelfHosted, expectedVault: "https://vault.bitwarden.com" },
    ])(
      "no extra initialization, returns expected host for each region %s",
      ({ region, expectedVault }) => {
        expect(sut.setCloudWebVaultUrl(region));
        expect(sut.getCloudWebVaultUrl()).toBe(expectedVault);
      },
    );
  });
});
