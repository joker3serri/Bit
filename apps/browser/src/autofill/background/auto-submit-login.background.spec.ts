import { MockProxy, mock } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { BrowserApi } from "../../platform/browser/browser-api";
import { ScriptInjectorService } from "../../platform/services/abstractions/script-injector.service";
import { AutofillService } from "../services/abstractions/autofill.service";
import {
  flushPromises,
  triggerTabOnActivatedEvent,
  triggerTabOnRemovedEvent,
  triggerTabOnUpdatedEvent,
  triggerWebNavigationOnCompletedEvent,
  triggerWebRequestOnBeforeRedirectEvent,
  triggerWebRequestOnBeforeRequestEvent,
} from "../spec/testing-utils";

import { AutoSubmitLoginBackground } from "./auto-submit-login.background";

describe("AutoSubmitLoginBackground", () => {
  let logService: MockProxy<LogService>;
  let autofillService: MockProxy<AutofillService>;
  let scriptInjectorService: MockProxy<ScriptInjectorService>;
  let authStatus$: BehaviorSubject<AuthenticationStatus>;
  let authService: MockProxy<AuthService>;
  let configService: MockProxy<ConfigService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let policyDetails: MockProxy<Policy>;
  let automaticAppLogInPolicy$: BehaviorSubject<Policy>;
  let policyAppliesToActiveUser$: BehaviorSubject<boolean>;
  let policyService: MockProxy<PolicyService>;
  let autoSubmitLoginBackground: AutoSubmitLoginBackground;
  const validIpdUrl1 = "https://example.com";
  const validIpdUrl2 = "https://subdomain.example3.com";
  const validAutoSubmitHost = "some-valid-url.com";
  const validAutoSubmitUrl = `https://${validAutoSubmitHost}/?autofill=1`;

  beforeEach(() => {
    logService = mock<LogService>();
    autofillService = mock<AutofillService>();
    scriptInjectorService = mock<ScriptInjectorService>();
    authStatus$ = new BehaviorSubject(AuthenticationStatus.Unlocked);
    authService = mock<AuthService>();
    authService.activeAccountStatus$ = authStatus$;
    configService = mock<ConfigService>({
      getFeatureFlag: jest.fn().mockResolvedValue(true),
    });
    platformUtilsService = mock<PlatformUtilsService>();
    policyDetails = mock<Policy>({
      enabled: true,
      data: {
        idpHost: `${validIpdUrl1} , https://example2.com/some/sub-route ,${validIpdUrl2}, [invalidValue] ,,`,
      },
    });
    automaticAppLogInPolicy$ = new BehaviorSubject<Policy>(policyDetails);
    policyAppliesToActiveUser$ = new BehaviorSubject<boolean>(true);
    policyService = mock<PolicyService>({
      get$: jest.fn().mockReturnValue(automaticAppLogInPolicy$),
      policyAppliesToActiveUser$: jest.fn().mockReturnValue(policyAppliesToActiveUser$),
    });
    autoSubmitLoginBackground = new AutoSubmitLoginBackground(
      logService,
      autofillService,
      scriptInjectorService,
      authService,
      configService,
      platformUtilsService,
      policyService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when the AutoSubmitLoginBackground feature is disabled", () => {
    it("destroys all event listeners when the AutomaticAppLogIn policy is not enabled", async () => {
      automaticAppLogInPolicy$.next(mock<Policy>({ ...policyDetails, enabled: false }));

      await autoSubmitLoginBackground.init();

      expect(chrome.webRequest.onBeforeRequest.removeListener).toHaveBeenCalled();
    });

    it("destroys all event listeners when the AutomaticAppLogIn policy does not apply to the current user", async () => {
      policyAppliesToActiveUser$.next(false);

      await autoSubmitLoginBackground.init();

      expect(chrome.webRequest.onBeforeRequest.removeListener).toHaveBeenCalled();
    });

    it("destroys all event listeners when the idpHost is not specified in the AutomaticAppLogIn policy", async () => {
      automaticAppLogInPolicy$.next(mock<Policy>({ ...policyDetails, data: { idpHost: "" } }));

      await autoSubmitLoginBackground.init();

      expect(chrome.webRequest.onBeforeRequest.addListener).not.toHaveBeenCalled();
    });
  });

  describe("when the AutoSubmitLoginBackground feature is enabled", () => {
    it("sets up the listeners when the AutomaticAppLogIn policy is enabled, applies to the current user, and the ipdHost is specified", async () => {
      await autoSubmitLoginBackground.init();

      expect(chrome.webRequest.onBeforeRequest.addListener).toHaveBeenCalled();
    });

    describe("starting the auto-submit login workflow", () => {
      let webRequestDetails: chrome.webRequest.WebRequestBodyDetails;

      beforeEach(async () => {
        webRequestDetails = mock<chrome.webRequest.WebRequestBodyDetails>({
          initiator: validIpdUrl1,
          url: validAutoSubmitUrl,
          type: "main_frame",
        });
        await autoSubmitLoginBackground.init();
      });

      it("sets up the auto-submit workflow when the web request occurs in the main frame and the destination URL contains a valid auto-fill param", () => {
        triggerWebRequestOnBeforeRequestEvent(webRequestDetails);

        expect(autoSubmitLoginBackground["currentAutoSubmitHostData"]).toStrictEqual({
          url: validAutoSubmitUrl,
          tabId: webRequestDetails.tabId,
        });
        expect(chrome.webNavigation.onCompleted.addListener).toBeCalledWith(expect.any(Function), {
          url: [{ hostEquals: validAutoSubmitHost }],
        });
      });

      it("sets up the auto-submit workflow when the web request occurs in a sub frame and the initiator of the request is a valid auto-submit host", async () => {
        const topFrameHost = "some-top-frame.com";
        const subFrameHost = "some-sub-frame.com";
        autoSubmitLoginBackground["validAutoSubmitHosts"].add(topFrameHost);
        webRequestDetails.type = "sub_frame";
        webRequestDetails.initiator = `https://${topFrameHost}`;
        webRequestDetails.url = `https://${subFrameHost}`;

        triggerWebRequestOnBeforeRequestEvent(webRequestDetails);

        expect(chrome.webNavigation.onCompleted.addListener).toBeCalledWith(expect.any(Function), {
          url: [{ hostEquals: subFrameHost }],
        });
      });

      describe("injecting the auto-submit login content script", () => {
        let webNavigationDetails: chrome.webNavigation.WebNavigationFramedCallbackDetails;

        beforeEach(() => {
          triggerWebRequestOnBeforeRequestEvent(webRequestDetails);
          webNavigationDetails = mock<chrome.webNavigation.WebNavigationFramedCallbackDetails>({
            tabId: webRequestDetails.tabId,
            url: webRequestDetails.url,
          });
        });

        it("skips injecting the content script when the extension is not unlocked", async () => {
          authStatus$.next(AuthenticationStatus.Locked);

          triggerWebNavigationOnCompletedEvent(webNavigationDetails);
          await flushPromises();

          expect(scriptInjectorService.inject).not.toHaveBeenCalled();
        });

        it("injects the auto-submit login content script", async () => {
          triggerWebNavigationOnCompletedEvent(webNavigationDetails);
          await flushPromises();

          expect(scriptInjectorService.inject).toBeCalledWith({
            tabId: webRequestDetails.tabId,
            injectDetails: {
              file: "content/auto-submit-login.js",
              runAt: "document_start",
              frame: "all_frames",
            },
          });
        });
      });
    });

    describe("cancelling an active auto-submit login workflow", () => {});

    describe("when the extension is running on a Safari browser", () => {
      const tabId = 1;
      const tab = mock<chrome.tabs.Tab>({ id: tabId, url: validIpdUrl1 });

      beforeEach(() => {
        platformUtilsService.isSafari.mockReturnValue(true);
        autoSubmitLoginBackground = new AutoSubmitLoginBackground(
          logService,
          autofillService,
          scriptInjectorService,
          authService,
          configService,
          platformUtilsService,
          policyService,
        );
        jest.spyOn(BrowserApi, "getTabFromCurrentWindow").mockResolvedValue(tab);
      });

      it("sets the most recent IDP host to the current tab", async () => {
        await autoSubmitLoginBackground.init();
        await flushPromises();

        expect(autoSubmitLoginBackground["mostRecentIdpHost"]).toStrictEqual({
          url: validIpdUrl1,
          tabId: tabId,
        });
      });

      describe("event listeners that update the most recently visited IDP host", () => {
        const newTabId = 2;
        const newTab = mock<chrome.tabs.Tab>({ id: newTabId, url: validIpdUrl2 });

        beforeEach(async () => {
          await autoSubmitLoginBackground.init();
        });

        it("updates the most recent idp host when a tab is activated", async () => {
          jest.spyOn(BrowserApi, "getTab").mockResolvedValue(newTab);

          triggerTabOnActivatedEvent(mock<chrome.tabs.TabActiveInfo>({ tabId: newTabId }));
          await flushPromises();

          expect(autoSubmitLoginBackground["mostRecentIdpHost"]).toStrictEqual({
            url: validIpdUrl2,
            tabId: newTabId,
          });
        });

        it("updates the most recent id host when a tab is updated", () => {
          triggerTabOnUpdatedEvent(
            newTabId,
            mock<chrome.tabs.TabChangeInfo>({ url: validIpdUrl1 }),
            newTab,
          );

          expect(autoSubmitLoginBackground["mostRecentIdpHost"]).toStrictEqual({
            url: validIpdUrl1,
            tabId: newTabId,
          });
        });

        describe("when a tab completes a navigation event", () => {
          it("clears the set of valid auto-submit hosts", () => {
            autoSubmitLoginBackground["validAutoSubmitHosts"].add(validIpdUrl1);

            triggerWebNavigationOnCompletedEvent(
              mock<chrome.webNavigation.WebNavigationFramedCallbackDetails>({
                tabId: newTabId,
                url: validIpdUrl2,
                frameId: 0,
              }),
            );

            expect(autoSubmitLoginBackground["validAutoSubmitHosts"].size).toBe(0);
          });

          it("updates the most recent idp host", () => {
            triggerWebNavigationOnCompletedEvent(
              mock<chrome.webNavigation.WebNavigationFramedCallbackDetails>({
                tabId: newTabId,
                url: validIpdUrl2,
                frameId: 0,
              }),
            );

            expect(autoSubmitLoginBackground["mostRecentIdpHost"]).toStrictEqual({
              url: validIpdUrl2,
              tabId: newTabId,
            });
          });

          it("clears the auto submit host data if the tab is removed or closed", () => {
            triggerWebNavigationOnCompletedEvent(
              mock<chrome.webNavigation.WebNavigationFramedCallbackDetails>({
                tabId: newTabId,
                url: validIpdUrl2,
                frameId: 0,
              }),
            );
            autoSubmitLoginBackground["currentAutoSubmitHostData"] = {
              url: validIpdUrl2,
              tabId: newTabId,
            };

            triggerTabOnRemovedEvent(newTabId, mock<chrome.tabs.TabRemoveInfo>());

            expect(autoSubmitLoginBackground["currentAutoSubmitHostData"]).toStrictEqual({});
          });
        });
      });

      it("allows the route to trigger auto-submit after a chain redirection to a valid auto-submit URL is made", async () => {
        await autoSubmitLoginBackground.init();
        autoSubmitLoginBackground["mostRecentIdpHost"] = {
          url: validIpdUrl1,
          tabId: tabId,
        };
        triggerWebRequestOnBeforeRedirectEvent(
          mock<chrome.webRequest.WebRedirectionResponseDetails>({
            url: validIpdUrl1,
            redirectUrl: validIpdUrl2,
            frameId: 0,
          }),
        );
        triggerWebRequestOnBeforeRedirectEvent(
          mock<chrome.webRequest.WebRedirectionResponseDetails>({
            url: validIpdUrl2,
            redirectUrl: validAutoSubmitUrl,
            frameId: 0,
          }),
        );

        triggerWebRequestOnBeforeRequestEvent(
          mock<chrome.webRequest.WebRequestBodyDetails>({
            tabId: tabId,
            url: `https://${validAutoSubmitHost}`,
            initiator: null,
            frameId: 0,
          }),
        );

        expect(chrome.webNavigation.onCompleted.addListener).toBeCalledWith(expect.any(Function), {
          url: [{ hostEquals: validAutoSubmitHost }],
        });
      });
    });
  });
});
