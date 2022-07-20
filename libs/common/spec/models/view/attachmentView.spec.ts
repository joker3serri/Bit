import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
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
    jest
      .spyOn(SymmetricCryptoKey, "fromJSON")
      .mockImplementation((key: string) => (key + "fromJSON") as any);

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
