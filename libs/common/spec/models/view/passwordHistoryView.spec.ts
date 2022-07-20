import { PasswordHistoryView } from "@bitwarden/common/models/view/passwordHistoryView";

describe("PasswordHistoryView", () => {
  const testValues = {
    lastUsedDate: new Date(),
    password: "mySecretPass",
  };

  it("toJSON creates object for serialization", () => {
    const ph = new PasswordHistoryView();
    Object.assign(ph, testValues);

    const actual = ph.toJSON();

    expect(actual).toEqual(testValues);
  });

  it("fromJSON initializes new view object", () => {
    const parsed = JSON.parse(JSON.stringify(testValues));
    const actual = PasswordHistoryView.fromJSON(parsed);

    const expected = new PasswordHistoryView();
    Object.assign(expected, testValues);

    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(PasswordHistoryView);
  });
});
