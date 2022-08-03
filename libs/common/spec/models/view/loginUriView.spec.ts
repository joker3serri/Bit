import { UriMatchType } from "@bitwarden/common/enums/uriMatchType";
import { LoginUriView } from "@bitwarden/common/models/view/loginUriView";

describe("LoginUriView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      match: UriMatchType.Host,
      uri: "http://example.com/login",
    };

    const actual = LoginUriView.fromJSON(testValues);

    const expected = Object.assign(new LoginUriView(), testValues);
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(LoginUriView);
  });
});
