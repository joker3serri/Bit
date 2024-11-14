import { parseCredentialId } from "./credential-id-utils";

describe("credential-id-utils", () => {
  describe("parseCredentialId", () => {
    it("returns credentialId in binary format when given a valid UUID string", () => {
      const result = parseCredentialId("08d70b74-e9f5-4522-a425-e5dcd40107e7");

      expect(result).toEqual(
        new Uint8Array([
          0x08, 0xd7, 0x0b, 0x74, 0xe9, 0xf5, 0x45, 0x22, 0xa4, 0x25, 0xe5, 0xdc, 0xd4, 0x01, 0x07,
          0xe7,
        ]),
      );
    });

    it("returns credentialId in binary format when given a valid Base64Url string", () => {
      const result = parseCredentialId("b64.CNcLdOn1RSKkJeXc1AEH5w");

      expect(result).toEqual(
        new Uint8Array([
          0x08, 0xd7, 0x0b, 0x74, 0xe9, 0xf5, 0x45, 0x22, 0xa4, 0x25, 0xe5, 0xdc, 0xd4, 0x01, 0x07,
          0xe7,
        ]),
      );
    });

    it("returns undefined when given an invalid Base64 string", () => {
      const result = parseCredentialId("b64.#$%&");

      expect(result).toBeUndefined();
    });

    it("returns undefined when given an invalid UUID string", () => {
      const result = parseCredentialId("invalid");

      expect(result).toBeUndefined();
    });
  });
});
