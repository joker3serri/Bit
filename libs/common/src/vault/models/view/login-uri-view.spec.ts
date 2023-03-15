import { UriMatchType } from "../../../enums/uriMatchType";

import { LoginUriView } from "./login-uri.view";

const testData = [
  {
    match: UriMatchType.Host,
    uri: "http://example.com/login",
    expected: "http://example.com/login",
  },
  {
    match: UriMatchType.Host,
    uri: "bitwarden.com",
    expected: "http://bitwarden.com",
  },
  {
    match: UriMatchType.Host,
    uri: "bitwarden.de",
    expected: "http://bitwarden.de",
  },
  {
    match: UriMatchType.Host,
    uri: "bitwarden.br",
    expected: "http://bitwarden.br",
  },
];

const exampleUris = {
  standard: "www.exampleapp.com.au:4000/userauth/login.html",
  subdomain: "www.auth.exampleapp.com.au",
  differentDomain: "www.exampleapp.co.uk/subpage",
  equivalentDomains: ["exampleapp.com.au", "exampleapp.com", "exampleapp.co.uk", "example.com"],
};

describe("LoginUriView", () => {
  it("isWebsite() given an invalid domain should return false", async () => {
    const uri = new LoginUriView();
    Object.assign(uri, { match: UriMatchType.Host, uri: "bit!:_&ward.com" });
    expect(uri.isWebsite).toBe(false);
  });

  testData.forEach((data) => {
    it(`isWebsite() given ${data.uri} should return true`, async () => {
      const uri = new LoginUriView();
      Object.assign(uri, { match: data.match, uri: data.uri });
      expect(uri.isWebsite).toBe(true);
    });

    it(`launchUri() given ${data.uri} should return ${data.expected}`, async () => {
      const uri = new LoginUriView();
      Object.assign(uri, { match: data.match, uri: data.uri });
      expect(uri.launchUri).toBe(data.expected);
    });

    it(`canLaunch() given ${data.uri} should return true`, async () => {
      const uri = new LoginUriView();
      Object.assign(uri, { match: data.match, uri: data.uri });
      expect(uri.canLaunch).toBe(true);
    });
  });

  it(`canLaunch should return false when MatchDetection is set to Regex`, async () => {
    const uri = new LoginUriView();
    Object.assign(uri, { match: UriMatchType.RegularExpression, uri: "bitwarden.com" });
    expect(uri.canLaunch).toBe(false);
  });

  it(`canLaunch() should return false when the given protocol does not match CanLaunchWhiteList`, async () => {
    const uri = new LoginUriView();
    Object.assign(uri, { match: UriMatchType.Host, uri: "someprotocol://bitwarden.com" });
    expect(uri.canLaunch).toBe(false);
  });

  describe("uri matching", () => {
    describe("using domain matching", () => {
      it("matches the same domain", () => {
        const uri = uriFactory(UriMatchType.Domain);
        const actual = uri.matchesUri(exampleUris.subdomain, []);
        expect(actual).toBe(true);
      });

      it("matches equivalent domains", () => {
        const uri = uriFactory(UriMatchType.Domain);
        const actual = uri.matchesUri(exampleUris.differentDomain, exampleUris.equivalentDomains);
        expect(actual).toBe(true);
      });

      it("does not match a different domain", () => {
        const uri = uriFactory(UriMatchType.Domain);
        const actual = uri.matchesUri(exampleUris.differentDomain, []);
        expect(actual).toBe(false);
      });

      // Actual integration test with the real blacklist, not ideal
      it("does not match domains that are blacklisted", () => {
        const googleEquivalentDomains = ["google.com", "script.google.com"];
        const uri = uriFactory(UriMatchType.Domain, "google.com");

        const actual = uri.matchesUri("script.google.com", googleEquivalentDomains);

        expect(actual).toBe(false);
      });
    });

    describe("using host matching", () => {
      it.todo("matches the same host");
      it.todo("does not match a different host");
    });

    describe("using exact matching", () => {
      it.todo("matches if both uris are the same");
      it.todo("does not match if the uris are different");
    });

    describe("using startsWith matching", () => {
      it.todo("matches if the start of the uri is the same");
      it.todo("does not match if the start of the uri is not the same");
    });

    describe("using regular expression matching", () => {
      it.todo("matches if the regular expression matches");
      it.todo("does not match if the regular expression does not match");
    });

    describe("using never matching", () => {
      it("does not match even if uris are identical", () => {
        const uri = uriFactory(UriMatchType.Never);
        const actual = uri.matchesUri(exampleUris.standard, []);
        expect(actual).toBe(false);
      });
    });
  });
});

function uriFactory(match: UriMatchType, uri: string = exampleUris.standard) {
  const loginUri = new LoginUriView();
  loginUri.match = match;
  loginUri.uri = uri;
  return loginUri;
}
