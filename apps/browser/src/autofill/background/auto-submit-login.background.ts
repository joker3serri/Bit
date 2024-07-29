import { firstValueFrom } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { BrowserApi } from "../../platform/browser/browser-api";
import { ScriptInjectorService } from "../../platform/services/abstractions/script-injector.service";
import { AutofillService } from "../services/abstractions/autofill.service";

import {
  AutoSubmitLoginBackground as AutoSubmitLoginBackgroundAbstraction,
  AutoSubmitLoginBackgroundExtensionMessageHandlers,
  AutoSubmitLoginMessage,
} from "./abstractions/auto-submit-login.background";

export class AutoSubmitLoginBackground implements AutoSubmitLoginBackgroundAbstraction {
  private validIdpHosts: Set<string> = new Set();
  private validAutoSubmitHosts: Set<string> = new Set();
  private mostRecentIdpHost: { url?: string; tabId?: number } = {};
  private currentAutoSubmitHostData: { url?: string; tabId?: number } = {};
  private readonly isSafariBrowser: boolean = false;
  private readonly extensionMessageHandlers: AutoSubmitLoginBackgroundExtensionMessageHandlers = {
    triggerAutoSubmitLogin: ({ message, sender }) => this.triggerAutoSubmitLogin(message, sender),
    multiStepAutoSubmitLoginComplete: ({ sender }) =>
      this.handleMultiStepAutoSubmitLoginComplete(sender),
  };

  constructor(
    private logService: LogService,
    private autofillService: AutofillService,
    private scriptInjectorService: ScriptInjectorService,
    private authService: AuthService,
    private configService: ConfigService,
    private platformUtilsService: PlatformUtilsService,
    private policyService: PolicyService,
  ) {
    this.isSafariBrowser = this.platformUtilsService.isSafari();
  }

  /**
   * Initializes the auto-submit login policy. Will return early if
   * the feature flag is not set. If the policy is not enabled, it
   * will trigger a removal of any established listeners.
   */
  async init() {
    const featureFlagEnabled = await this.configService.getFeatureFlag(
      FeatureFlag.IdpAutoSubmitLogin,
    );
    if (featureFlagEnabled) {
      this.policyService
        .get$(PolicyType.AutomaticAppLogIn)
        .subscribe(this.handleAutoSubmitLoginPolicySubscription.bind(this));
    }
  }

  /**
   * Handles changes to the AutomaticAppLogIn policy. If the policy is not enabled, trigger
   * a removal of any established listeners. If the policy is enabled, apply the policy to
   * the active user.
   *
   * @param policy - The AutomaticAppLogIn policy details.
   */
  private handleAutoSubmitLoginPolicySubscription = (policy: Policy) => {
    if (!policy?.enabled) {
      this.destroy();
      return;
    }

    this.applyPolicyToActiveUser(policy).catch((error) => this.logService.error(error));
  };

  /**
   * Verifies if the policy applies to the active user. If so, the event listeners
   * used to trigger auto-submission of login forms will be established.
   *
   * @param policy - The AutomaticAppLogIn policy details.
   */
  private applyPolicyToActiveUser = async (policy: Policy) => {
    const policyAppliesToUser = await firstValueFrom(
      this.policyService.policyAppliesToActiveUser$(PolicyType.AutomaticAppLogIn),
    );

    if (!policyAppliesToUser) {
      this.destroy();
      return;
    }

    await this.setupAutoSubmitLoginListeners(policy);
  };

  /**
   * Sets up the event listeners used to trigger auto-submission of login forms.
   *
   * @param policy - The AutomaticAppLogIn policy details.
   */
  private setupAutoSubmitLoginListeners = async (policy: Policy) => {
    this.parseIpdHostsFromPolicy(policy?.data.idpHost);
    if (!this.validIdpHosts.size) {
      this.destroy();
      return;
    }

    BrowserApi.addListener(chrome.runtime.onMessage, this.handleExtensionMessage);
    chrome.webRequest.onBeforeRequest.addListener(this.handleOnBeforeRequest, {
      urls: ["<all_urls>"],
      types: ["main_frame", "sub_frame"],
    });
    chrome.webRequest.onBeforeRedirect.addListener(this.handleWebRequestOnBeforeRedirect, {
      urls: ["<all_urls>"],
      types: ["main_frame", "sub_frame"],
    });

    if (this.isSafariBrowser) {
      this.initSafari().catch((error) => this.logService.error(error));
    }
  };

  /**
   * Parses the comma-separated list of IDP hosts from the AutomaticAppLogIn policy.
   *
   * @param idpHost - The comma-separated list of IDP hosts.
   */
  private parseIpdHostsFromPolicy = (idpHost?: string) => {
    if (!idpHost) {
      return;
    }

    const urls = idpHost.split(",");
    urls.forEach((url) => {
      const host = this.getUrlHost(url?.trim());
      if (host) {
        this.validIdpHosts.add(host);
      }
    });
  };

  private handleOnBeforeRequest = (details: chrome.webRequest.WebRequestBodyDetails) => {
    const requestInitiator = this.getRequestInitiator(details);
    const isValidInitiator = this.isValidInitiator(requestInitiator);

    if (
      this.postRequestEncounteredAfterSubmission(details, isValidInitiator) ||
      this.requestRedirectsToInvalidHost(details, isValidInitiator)
    ) {
      this.clearAutoSubmitHostData();
      return;
    }

    if (isValidInitiator && this.shouldRouteTriggerAutoSubmit(details, requestInitiator)) {
      this.setupAutoSubmitFlow(details);
      return;
    }

    this.disableAutoSubmitFlow(requestInitiator, details).catch((error) =>
      this.logService.error(error),
    );
  };

  private postRequestEncounteredAfterSubmission = (
    details: chrome.webRequest.WebRequestBodyDetails,
    isValidInitiator: boolean,
  ) => {
    return details.method === "POST" && this.validAutoSubmitHosts.size > 0 && isValidInitiator;
  };

  /**
   * Determines if a request is attempting to redirect to an invalid host. We identify this as a case
   * where the top level frame has navigated to either an invalid IDP host or auto-submit host.
   *
   * @param details - The details of the request.
   * @param isValidInitiator - A flag indicating if the initiator of the request is valid.
   */
  private requestRedirectsToInvalidHost = (
    details: chrome.webRequest.WebRequestBodyDetails,
    isValidInitiator: boolean,
  ) => {
    return (
      this.validAutoSubmitHosts.size > 0 &&
      this.isRequestInMainFrame(details) &&
      (!isValidInitiator || !this.isValidAutoSubmitHost(details.url))
    );
  };

  private setupAutoSubmitFlow = (details: chrome.webRequest.WebRequestBodyDetails) => {
    if (this.isRequestInMainFrame(details)) {
      this.currentAutoSubmitHostData = {
        url: details.url,
        tabId: details.tabId,
      };
    }

    const autoSubmitHost = this.getUrlHost(details.url);
    this.validAutoSubmitHosts.add(autoSubmitHost);
    chrome.webNavigation.onCompleted.removeListener(this.handleAutoSubmitHostNavigationCompleted);
    chrome.webNavigation.onCompleted.addListener(this.handleAutoSubmitHostNavigationCompleted, {
      url: [{ hostEquals: autoSubmitHost }],
    });
  };

  private disableAutoSubmitFlow = async (
    requestInitiator: string,
    details: chrome.webRequest.WebRequestBodyDetails,
  ) => {
    if (this.isValidAutoSubmitHost(requestInitiator)) {
      this.removeUrlFromAutoSubmitHosts(requestInitiator);
      return;
    }

    const tab = await BrowserApi.getTab(details.tabId);
    if (this.isValidAutoSubmitHost(tab?.url)) {
      this.removeUrlFromAutoSubmitHosts(tab.url);
    }
  };

  private clearAutoSubmitHostData = () => {
    this.validAutoSubmitHosts.clear();
    this.currentAutoSubmitHostData = {};
    this.mostRecentIdpHost = {};
  };

  private handleWebRequestOnBeforeRedirect = (
    details: chrome.webRequest.WebRedirectionResponseDetails,
  ) => {
    if (this.isRequestInMainFrame(details) && this.urlContainsAutoFillParam(details.redirectUrl)) {
      this.validAutoSubmitHosts.add(this.getUrlHost(details.redirectUrl));
      this.validAutoSubmitHosts.add(this.getUrlHost(details.url));
    }
  };

  private handleAutoSubmitHostNavigationCompleted = (
    details: chrome.webNavigation.WebNavigationFramedCallbackDetails,
  ) => {
    if (
      details.tabId !== this.currentAutoSubmitHostData.tabId ||
      !this.urlContainsAutoFillParam(details.url)
    ) {
      return;
    }

    this.injectAutoSubmitLoginScript(details.tabId).catch((error) => this.logService.error(error));
    chrome.webNavigation.onCompleted.removeListener(this.handleAutoSubmitHostNavigationCompleted);
  };

  private injectAutoSubmitLoginScript = async (tabId: number) => {
    if ((await this.getAuthStatus()) !== AuthenticationStatus.Unlocked) {
      return;
    }

    await this.scriptInjectorService.inject({
      tabId: tabId,
      injectDetails: {
        file: "content/auto-submit-login.js",
        runAt: "document_start",
        frame: "all_frames",
      },
    });
  };

  private getAuthStatus = async () => {
    return firstValueFrom(this.authService.activeAccountStatus$);
  };

  private isValidInitiator = (url: string) => {
    return this.isValidIdpHost(url) || this.isValidAutoSubmitHost(url);
  };

  private isValidIdpHost = (url: string) => {
    const host = this.getUrlHost(url);
    if (!host) {
      return false;
    }

    return this.validIdpHosts.has(host);
  };

  private isValidAutoSubmitHost = (url: string) => {
    const host = this.getUrlHost(url);
    if (!host) {
      return false;
    }

    return this.validAutoSubmitHosts.has(host);
  };

  private removeUrlFromAutoSubmitHosts = (url: string) => {
    this.validAutoSubmitHosts.delete(this.getUrlHost(url));
  };

  /**
   * Determines if the provided URL is a valid auto-submit host. If the request is occurring
   * in the main frame, we will check for the presence of the `autofill=1` query parameter.
   * If the request is occurring in a sub frame, the main frame URL should be set as a
   * valid auto-submit host and can be used to validate the request.
   *
   * @param details - The details of the request.
   * @param initiator - The initiator of the request.
   */
  private shouldRouteTriggerAutoSubmit = (
    details: chrome.webRequest.ResourceRequest,
    initiator: string,
  ) => {
    if (this.isRequestInMainFrame(details)) {
      return (
        this.urlContainsAutoFillParam(details.url) ||
        this.triggerAutoSubmitAfterRedirectOnSafari(details.url)
      );
    }

    return this.isValidAutoSubmitHost(initiator);
  };

  /**
   * Determines if the provided URL contains the `autofill=1` query parameter.
   *
   * @param url - The URL to check for the `autofill=1` query parameter.
   */
  private urlContainsAutoFillParam = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.search.indexOf("autofill=1") !== -1;
    } catch {
      return false;
    }
  };

  /**
   * Extracts the host from a given URL.
   * Will return an empty string if the provided URL is invalid.
   *
   * @param url - The URL to extract the host from.
   */
  private getUrlHost = (url: string) => {
    let parsedUrl = url;
    if (!parsedUrl) {
      return "";
    }

    if (!parsedUrl.startsWith("http")) {
      parsedUrl = `https://${parsedUrl}`;
    }

    try {
      const urlObj = new URL(parsedUrl);
      return urlObj.host;
    } catch {
      return "";
    }
  };

  /**
   * Determines the initiator of a request. If the request is happening in a Safari browser, we
   * need to determine the initiator based on the stored most recently visited IDP host. When
   * handling a sub frame request in Safari, we treat the passed URL detail as the initiator
   * of the request, as long as an IPD host has been previously identified.
   *
   * @param details - The details of the request.
   */
  private getRequestInitiator = (details: chrome.webRequest.ResourceRequest) => {
    if (!this.isSafariBrowser) {
      return details.initiator || (details as browser.webRequest._OnBeforeRequestDetails).originUrl;
    }

    if (this.isRequestInMainFrame(details)) {
      return this.mostRecentIdpHost.url;
    }

    if (!this.mostRecentIdpHost.url) {
      return "";
    }

    return details.url;
  };

  /**
   * Verifies if a request is occurring in the main / top-level frame of a tab.
   *
   * @param details - The details of the request.
   */
  private isRequestInMainFrame = (details: chrome.webRequest.ResourceRequest) => {
    if (this.isSafariBrowser) {
      return details.frameId === 0;
    }

    return details.type === "main_frame";
  };

  private triggerAutoSubmitLogin = async (
    message: AutoSubmitLoginMessage,
    sender: chrome.runtime.MessageSender,
  ) => {
    await this.autofillService.doAutoFillOnTab(
      [
        {
          frameId: sender.frameId,
          tab: sender.tab,
          details: message.pageDetails,
        },
      ],
      sender.tab,
      true,
      true,
    );
  };

  private handleMultiStepAutoSubmitLoginComplete = async (sender: chrome.runtime.MessageSender) => {
    this.removeUrlFromAutoSubmitHosts(sender.url);
  };

  /**
   * Initializes several fallback event listeners for the auto-submit login feature on the Safari browser.
   * This is required due to limitations that Safari has with the `webRequest` API. Specifically, Safari
   * does not provide the `initiator` of a request, which is required to determine if a request is coming
   * from a valid IDP host.
   */
  private async initSafari() {
    const currentTab = await BrowserApi.getTabFromCurrentWindow();
    if (currentTab) {
      this.setMostRecentIdpHost(currentTab.url, currentTab.id);
    }

    chrome.tabs.onActivated.addListener(this.handleSafariTabOnActivated);
    chrome.tabs.onUpdated.addListener(this.handleSafariTabOnUpdated);
    chrome.webNavigation.onCompleted.addListener(this.handleSafariWebNavigationOnCompleted);
  }

  /**
   * Sets the most recent IDP host based on the provided URL and tab ID.
   *
   * @param url - The URL to set as the most recent IDP host.
   * @param tabId - The tab ID associated with the URL.
   */
  private setMostRecentIdpHost(url: string, tabId: number) {
    if (this.isValidIdpHost(url)) {
      this.mostRecentIdpHost = { url, tabId };
    }
  }

  /**
   * Triggers an update of the most recently visited IDP host when a user focuses a different tab.
   *
   * @param activeInfo - The active tab information.
   */
  private handleSafariTabOnActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    const tab = await BrowserApi.getTab(activeInfo.tabId);
    if (tab) {
      this.setMostRecentIdpHost(tab.url, tab.id);
    }
  };

  /**
   * Triggers an update of the most recently visited IDP host when the URL of a tab is updated.
   *
   * @param tabId - The tab ID associated with the URL.
   * @param changeInfo - The change information of the tab.
   */
  private handleSafariTabOnUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (changeInfo) {
      this.setMostRecentIdpHost(changeInfo.url, tabId);
    }
  };

  /**
   * Handles the completion of a web navigation event on the Safari browser. If the navigation event
   * is for the main frame and the URL is a valid IDP host, the most recent IDP host will be updated.
   *
   * @param details - The web navigation details.
   */
  private handleSafariWebNavigationOnCompleted = (
    details: chrome.webNavigation.WebNavigationFramedCallbackDetails,
  ) => {
    if (details.frameId === 0 && this.isValidIdpHost(details.url)) {
      this.validAutoSubmitHosts.clear();
      this.mostRecentIdpHost = {
        url: details.url,
        tabId: details.tabId,
      };
      chrome.tabs.onRemoved.addListener(this.handleSafariTabOnRemoved);
    }
  };

  /**
   * Handles the removal of a tab on the Safari browser. If the tab being removed is the current
   * auto-submit host tab, all data associated with the current auto-submit workflow will be cleared.
   *
   * @param tabId - The tab ID of the tab being removed.
   */
  private handleSafariTabOnRemoved = (tabId: number) => {
    if (this.currentAutoSubmitHostData.tabId === tabId) {
      this.clearAutoSubmitHostData();
      chrome.tabs.onRemoved.removeListener(this.handleSafariTabOnRemoved);
    }
  };

  /**
   * Determines if the auto-submit login feature should be triggered after a redirect on the Safari browser.
   * This is required because Safari does not provide query params for the URL that is being routed to within
   * the onBefore request listener.
   *
   * @param url - The URL of the redirect.
   */
  private triggerAutoSubmitAfterRedirectOnSafari = (url: string) => {
    return this.isSafariBrowser && this.isValidAutoSubmitHost(url);
  };

  private handleExtensionMessage = async (
    message: AutoSubmitLoginMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    const { tab, url } = sender;
    if (tab?.id !== this.currentAutoSubmitHostData.tabId || !this.isValidAutoSubmitHost(url)) {
      return null;
    }

    const handler: CallableFunction | undefined = this.extensionMessageHandlers[message?.command];
    if (!handler) {
      return null;
    }

    const messageResponse = handler({ message, sender });
    if (typeof messageResponse === "undefined") {
      return null;
    }

    Promise.resolve(messageResponse)
      .then((response) => sendResponse(response))
      .catch(this.logService.error);
    return true;
  };

  /**
   * Tears down all established event listeners for the auto-submit login feature.
   */
  private destroy() {
    BrowserApi.removeListener(chrome.runtime.onMessage, this.handleExtensionMessage);
    chrome.webRequest.onBeforeRequest.removeListener(this.handleOnBeforeRequest);
    chrome.webRequest.onBeforeRedirect.removeListener(this.handleWebRequestOnBeforeRedirect);
    chrome.webNavigation.onCompleted.removeListener(this.handleAutoSubmitHostNavigationCompleted);
    chrome.webNavigation.onCompleted.removeListener(this.handleSafariWebNavigationOnCompleted);
    chrome.tabs.onActivated.removeListener(this.handleSafariTabOnActivated);
    chrome.tabs.onUpdated.removeListener(this.handleSafariTabOnUpdated);
    chrome.tabs.onRemoved.removeListener(this.handleSafariTabOnRemoved);
  }
}
