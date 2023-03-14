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
    const pageUrl = "www.auth.example.com/userauth/login.html";

    beforeEach(() => {
      loginItem = new CipherView();
      loginItem.login = new LoginView();

      const uri1 = new LoginUriView();
      uri1.uri = "mail.example.com";
      uri1.match = UriMatchType.Domain;

      const uri2 = new LoginUriView();
      uri2.uri = "sso.example.com";
      uri2.match = UriMatchType.StartsWith;

      loginItem.login.uris = [uri1, uri2];
    });

    it("trusts the pageUrl if it matches the tabUrl exactly", () => {
      const actual = autofillService.untrustedIframe(tabUrl, tabUrl, loginItem);
      expect(actual).toBe(false);
    });

    it("trusts the pageUrl if it is an equivalent domain of the tabUrl", () => {
      const mockEquivalentDomains = [
        "example.com",
        "api.example.com",
        "auth.example.com",
        "mail.example.com",
      ];
      settingsService.getEquivalentDomains
        .calledWith(tabUrl)
        .mockReturnValue(mockEquivalentDomains);

      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it("doesn't trust the pageUrl if it isn't an equivalent domain of the tabUrl", () => {
      const mockEquivalentDomains = ["example.com", "api.example.com", "mail.example.com"];
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

    const uriMatchCases = [
      [UriMatchType[UriMatchType.Domain], UriMatchType.Domain],
      [UriMatchType[UriMatchType.Host], UriMatchType.Host],
      [UriMatchType[UriMatchType.Never], UriMatchType.Never],
      [UriMatchType[UriMatchType.RegularExpression], UriMatchType.RegularExpression],
      [UriMatchType[UriMatchType.StartsWith], UriMatchType.StartsWith],
    ];

    it.each(uriMatchCases)(
      "doesn't trust the page URL if the saved URI uses %p match settings",
      (matchTypeName: string, matchType: UriMatchType) => {
        const uri = new LoginUriView();
        uri.uri = pageUrl;
        uri.match = matchType;
        loginItem.login.uris.push(uri);

        const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);

        expect(actual).toBe(true);
      }
    );

    it("doesn't trust the page URL if saved URIs are null", () => {
      delete loginItem.login.uris;
      const actual = autofillService.untrustedIframe(pageUrl, tabUrl, loginItem);
      expect(actual).toBe(true);
    });

    it("doesn't trust the page URL if the pageURL is null", () => {
      const actual = autofillService.untrustedIframe(null, tabUrl, loginItem);
      expect(actual).toBe(true);
    });

    it("doesn't trust the page URL if the tabURL is null", () => {
      const actual = autofillService.untrustedIframe(pageUrl, null, loginItem);
      expect(actual).toBe(true);
    });
  });
});
