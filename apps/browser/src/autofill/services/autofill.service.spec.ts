import { mock, MockProxy } from "jest-mock-extended";

import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { UriMatchType } from "@bitwarden/common/enums/uriMatchType";
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

    it('doesn\'t trust the pageUrl if there is no matching saved URI with "Exact" match settings', () => {
      // Uri matches but MatchType is incorrect
      const wrongUriMatchTypes = [
        UriMatchType.Domain,
        UriMatchType.Host,
        UriMatchType.Never,
        UriMatchType.RegularExpression,
        UriMatchType.StartsWith,
      ];

      wrongUriMatchTypes.forEach((matchType) => {
        const uri = new LoginUriView();
        uri.uri = pageUrl;
        uri.match = matchType;
        loginItem.login.uris.push(uri);
      });

      // MatchType is correct but uri doesn't match
      const uriWrongUri = new LoginUriView();
      uriWrongUri.uri = pageUrl + "#login";
      uriWrongUri.match = UriMatchType.Exact;
      loginItem.login.uris.push(uriWrongUri);

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
