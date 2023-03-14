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
    // Testing the private method isn't ideal but setting up full autofill details is too complex for now
    let loginItem: CipherView;

    const tabUrl = "www.example.com/login";
    const pageUrl = "www.auth.example.com/userauth/login.html";

    beforeEach(() => {
      loginItem = new CipherView();
      loginItem.login = new LoginView();
    });

    it("trusts the pageUrl if it matches the tabUrl exactly", () => {
      const actual = (autofillService as any).untrustedIframe(tabUrl, tabUrl, loginItem);

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

      const actual = (autofillService as any).untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(false);
    });

    it("doesn't trust the pageUrl if it isn't an equivalent domain of the tabUrl", () => {
      const mockEquivalentDomains = ["example.com", "api.example.com", "mail.example.com"];
      settingsService.getEquivalentDomains
        .calledWith(tabUrl)
        .mockReturnValue(mockEquivalentDomains);

      const actual = (autofillService as any).untrustedIframe(pageUrl, tabUrl, loginItem);

      expect(actual).toBe(true);
    });

    it('trusts the pageUrl if it matches a saved URI with "Exact" match settings', () => {
      const uri1 = new LoginUriView();
      uri1.uri = "mail.example.com";
      uri1.match = UriMatchType.Domain;

      // Should match
      const uri2 = new LoginUriView();
      uri2.uri = pageUrl;
      uri2.match = UriMatchType.Exact;

      const uri3 = new LoginUriView();
      uri3.uri = "sso.example.com";
      uri3.match = UriMatchType.StartsWith;

      loginItem.login.uris = [uri1, uri2, uri3];

      const actual = (autofillService as any).untrustedIframe(pageUrl, tabUrl, loginItem);

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
        const uri1 = new LoginUriView();
        uri1.uri = "mail.example.com";
        uri1.match = UriMatchType.Domain;

        // Should match
        const uri2 = new LoginUriView();
        uri2.uri = pageUrl;
        uri2.match = matchType;

        const uri3 = new LoginUriView();
        uri3.uri = "sso.example.com";
        uri3.match = UriMatchType.StartsWith;

        loginItem.login.uris = [uri1, uri2, uri3];

        const actual = (autofillService as any).untrustedIframe(pageUrl, tabUrl, loginItem);

        expect(actual).toBe(true);
      }
    );

    it.todo("what happens if something is null?");
  });
});
