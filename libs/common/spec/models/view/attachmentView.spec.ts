import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { AttachmentView } from "@bitwarden/common/models/view/attachmentView";

jest.mock("@bitwarden/common/models/domain/symmetricCryptoKey");

describe("AttachmentView", () => {
  it("fromJSON initializes new view object", () => {
    const testValues = {
      id: "1234",
      url: "http://example.com",
      size: "1000",
      sizeName: "kb",
      fileName: "my filename",
      key: "encKey" as any,
    };

    const mockFromJson = (key: any) => (key + "fromJSON") as any;
    jest.spyOn(SymmetricCryptoKey, "fromJSON").mockImplementation(mockFromJson);

    const actual = AttachmentView.fromJSON(testValues);

    const expected = Object.assign(new AttachmentView(), testValues, { key: "encKeyfromJSON" });
    expect(actual).toEqual(expected);
    expect(actual).toBeInstanceOf(AttachmentView);
  });
});
