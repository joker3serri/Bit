import { UriMatchType } from "@bitwarden/common/enums/uriMatchType";
import { LoginUriView } from "@bitwarden/common/models/view/loginUriView";

const testValues = {
  match: UriMatchType.Host,
  uri: "http://example.com/login",
};

describe("LoginUriView", () => {
  it("fromJSON initializes new view object", () => {
    const actual = LoginUriView.fromJSON(testValues);

    const expected = new LoginUriView();
    Object.assign(expected, testValues);

    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(LoginUriView);
  });
});
