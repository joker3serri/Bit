import { PasswordHistoryView } from "@bitwarden/common/vault/models/view/password-history.view";

describe("PasswordHistoryView", () => {
  it("fromJSON initializes nested objects", () => {
    const lastUsedDate = new Date();

    const actual = PasswordHistoryView.fromJSON({
      lastUsedDate: lastUsedDate.toISOString(),
    });

    expect(actual.lastUsedDate).toEqual(lastUsedDate);
  });
});
