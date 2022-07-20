import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { ParsedObject } from "@bitwarden/common/models/storable";
import { AttachmentView } from "@bitwarden/common/models/view/attachmentView";

jest.mock("@bitwarden/common/models/domain/symmetricCryptoKey");

describe("AttachmentView", () => {
  const testValues = {
    id: "1234",
    url: "http://example.com",
    size: "1000",
    sizeName: "kb",
    fileName: "my filename",
    key: "encKey" as any,
  };

  beforeEach(() => {
    (SymmetricCryptoKey as any).mockClear();
  });

  it("fromJSON initializes new view object", () => {
    const mockFromJson = (key: any) => (key + "fromJSON") as any;
    jest.spyOn(SymmetricCryptoKey, "fromJSON").mockImplementation(mockFromJson);

    const actual = AttachmentView.fromJSON(testValues);

    const expected = new AttachmentView();
    Object.assign(expected, testValues, { key: "encKeyfromJSON" });

    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(AttachmentView);
  });

  it("toJSON creates object for serialization", () => {
    const attachment = new AttachmentView();
    Object.assign(attachment, testValues);

    const actual = attachment.toJSON();

    expect(actual).toEqual(testValues);
  });
});
