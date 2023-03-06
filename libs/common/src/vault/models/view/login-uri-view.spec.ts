import { UriMatchType } from "../../../enums/uriMatchType";

import { LoginUriView } from "./login-uri.view";

const testData = [
  {
    match: UriMatchType.Host,
    uri: "http://example.com/login",
    expected: "http://example.com/login",
  },
  {
    match: UriMatchType.Origin,
    uri: "https://example.com/path",
    expected: "https://example.com/path",
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

  it(`canLaunch() should return false when origin does not match`, async () => {
    const uri = new LoginUriView();
    Object.assign(uri, { match: UriMatchType.Origin, uri: "someprotocol://bitwarden.com" });
    expect(uri.canLaunch).toBe(false);
  });

  it(`canLaunch() should return true when origin does match`, async () => {
    const uri = new LoginUriView();
    Object.assign(uri, { match: UriMatchType.Origin, uri: "http://bitwarden.com" });
    expect(uri.canLaunch).toBe(true);
  });
});
