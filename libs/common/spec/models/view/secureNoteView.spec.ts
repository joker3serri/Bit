import { SecureNoteType } from "@bitwarden/common/enums/secureNoteType";
import { SecureNoteView } from "@bitwarden/common/models/view/secureNoteView";

describe("SecureNoteView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      type: SecureNoteType.Generic,
    };

    const actual = SecureNoteView.fromJSON(testValues);

    const expected = Object.assign(new SecureNoteView(), testValues);
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(SecureNoteView);
  });
});
