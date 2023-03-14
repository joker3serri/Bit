import { mock, MockProxy } from "jest-mock-extended";

import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { UriMatchType } from "@bitwarden/common/enums/uriMatchType";
import { Utils } from "@bitwarden/common/misc/utils";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";

import { BrowserStateService } from "../../services/abstractions/browser-state.service";

import AutofillService from "./autofill.service";

describe("AutofillService", () => {
  let cipherService: MockProxy<CipherService>;
  let browserStateService: MockProxy<BrowserStateService>;
  let totpService: MockProxy<TotpService>;
  let eventCollectionService: MockProxy<EventCollectionService>;
  let logService: MockProxy<LogService>;
  let settingsService: MockProxy<SettingsService>;

  let autofillService: AutofillService;

  beforeEach(() => {
    cipherService = mock<CipherService>();
    browserStateService = mock<BrowserStateService>();
    totpService = mock<TotpService>();
    eventCollectionService = mock<EventCollectionService>();
    logService = mock<LogService>();
    settingsService = mock<SettingsService>();

    autofillService = new AutofillService(
      cipherService,
      browserStateService,
      totpService,
      eventCollectionService,
      logService,
      settingsService
    );
  });

  describe("untrusted iframe detection", () => {
    let loginItem: CipherView;

    // The top level URL of the tab - this is what Bitwarden uses to find matching websites
    const tabUrl = "www.example.com/login";

    // The URL of the iframe - this is where we the user wants to autofill
    const pageUrl = "www.exampleapp.com.au/userauth/login.html";

    beforeEach(() => {
      loginItem = new CipherView();
      loginItem.login = new LoginView();
      loginItem.login.uris = [];
    });

    it("trusts the pageUrl if it has the same domain as the tabUrl", () => {
      const pageUrlSubdomain = "www.auth.example.com/userauth/login.html";

      const actual = autofillService.untrustedIframe(pageUrlSubdomain, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it("trusts the pageUrl if it is an equivalent domain of the tabUrl", () => {
      const mockEquivalentDomains = [
        "example.com",
        "exampleapp.com",
        "exampleapp.co.uk",
        "exampleapp.com.au", // Should match pageUrl domain
      ];
      settingsService.getEquivalentDomains
        .calledWith(tabUrl)
        .mockReturnValue(mockEquivalentDomains);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it("doesn't trust the pageUrl if it isn't an equivalent domain of the tabUrl", () => {
      const mockEquivalentDomains = ["example.com", "exampleflights.com", "examplehotels.com"];
      settingsService.getEquivalentDomains
        .calledWith(tabUrl)
        .mockReturnValue(mockEquivalentDomains);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(true);
    });

    it('trusts the pageUrl if it matches a saved URI with "Exact" match settings', () => {
      const uri = new LoginUriView();
      uri.uri = pageUrl;
      uri.match = UriMatchType.Exact;
      loginItem.login.uris.push(uri);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it('trusts the pageUrl if it matches a saved URI with "Host" match settings', () => {
      const uri = new LoginUriView();
      uri.uri = Utils.getHost(pageUrl);
      uri.match = UriMatchType.Host;
      loginItem.login.uris.push(uri);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it('trusts the pageUrl if it matches a saved URI with "Domain" match settings', () => {
      const uri = new LoginUriView();
      uri.uri = Utils.getDomain(pageUrl);
      uri.match = UriMatchType.Domain;
      loginItem.login.uris.push(uri);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it('trusts the pageUrl if it matches a saved URI with "StartsWith" match settings', () => {
      const uri = new LoginUriView();
      uri.uri = "www.exampleapp.com.au";
      uri.match = UriMatchType.StartsWith;
      loginItem.login.uris.push(uri);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it('trusts the pageUrl if it matches a saved URI with "Regex" match settings', () => {
      const uri = new LoginUriView();
      uri.uri = "www.exampleapp.com.au/[A-Za-z0-9]+/login.html";
      uri.match = UriMatchType.RegularExpression;
      loginItem.login.uris.push(uri);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it('does not trust the pageUrl if it matches a saved URI with "Never" match settings', () => {
      const uri = new LoginUriView();
      uri.uri = pageUrl;
      uri.match = UriMatchType.Never;
      loginItem.login.uris.push(uri);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(true);
    });

    it("doesn't trust the pageUrl if saved URIs are null", () => {
      delete loginItem.login.uris;
      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);
      expect(actual).toBe(true);
    });

    it("doesn't trust the pageUrl if the pageUrl is null", () => {
      const actual = autofillService.untrustedIframe(null, tabUrl, loginItem);
      expect(actual).toBe(true);
    });

    it("doesn't trust the pageUrl if the tabUrl is null", () => {
      const actual = autofillService.untrustedIframe(pageUrl, null, loginItem);
      expect(actual).toBe(true);
    });
  });
});
