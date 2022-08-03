import { LoginUriView } from "@bitwarden/common/models/view/loginUriView";
import { LoginView } from "@bitwarden/common/models/view/loginView";

jest.mock("@bitwarden/common/models/view/loginUriView");

const testValues = {
  username: "myUsername",
  password: "myPassword",
  totp: "totpSeed",
  autofillOnPageLoad: true,
  uris: ["uri1", "uri2", "uri3"],
  passwordRevisionDate: new Date(),
};

describe("LoginView", () => {
  beforeEach(() => {
    (LoginUriView as any).mockClear();
  });

  it("fromJSON initializes new view object", () => {
    const parsed = JSON.parse(JSON.stringify(testValues));

    jest
      .spyOn(LoginUriView, "fromJSON")
      .mockImplementation((key: any) => (key + "fromJSON") as any);

    const login = LoginView.fromJSON(parsed);

    expect(login).toEqual({
      ...testValues,
      uris: ["uri1fromJSON", "uri2fromJSON", "uri3fromJSON"],
    });
    expect(login).toBeInstanceOf(LoginView);
  });
});
