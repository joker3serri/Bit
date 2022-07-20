import { SecureNoteType } from "@bitwarden/common/enums/secureNoteType";
import { SecureNoteView } from "@bitwarden/common/models/view/secureNoteView";

describe("SecureNoteView", () => {
  it("toJSON creates object for serialization", () => {
    const secureNote = new SecureNoteView();
    secureNote.type = SecureNoteType.Generic;

    const actual = secureNote.toJSON();

    expect(actual).toEqual({
      type: SecureNoteType.Generic,
    });
  });

  it("fromJSON hydrates new view object", () => {
    const actual = SecureNoteView.fromJSON({
      type: SecureNoteType.Generic,
    });

    const expected = new SecureNoteView();
    expected.type = SecureNoteType.Generic;

    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(SecureNoteView);
  });
});
