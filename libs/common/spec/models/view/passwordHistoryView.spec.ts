import { PasswordHistoryView } from "@bitwarden/common/models/view/passwordHistoryView";

describe("PasswordHistoryView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      lastUsedDate: new Date(),
      password: "mySecretPass",
    };

    const parsed = JSON.parse(JSON.stringify(testValues));
    const actual = PasswordHistoryView.fromJSON(parsed);

    const expected = Object.assign(new PasswordHistoryView(), testValues);
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(PasswordHistoryView);
  });
});
