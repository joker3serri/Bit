import { mock, MockProxy } from "jest-mock-extended";

import { makeStaticByteArray, mockEnc, mockFromJson } from "../../../../spec";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { EncryptedString, EncString } from "../../../platform/models/domain/enc-string";
import {
  OrgKey,
  SymmetricCryptoKey,
  UserKey,
} from "../../../platform/models/domain/symmetric-crypto-key";
import { ContainerService } from "../../../platform/services/container.service";
import { AttachmentData } from "../../models/data/attachment.data";
import { Attachment } from "../../models/domain/attachment";

describe("Attachment", () => {
  let data: AttachmentData;

  beforeEach(() => {
    data = {
      id: "id",
      url: "url",
      fileName: "fileName",
      key: "key",
      size: "1100",
      sizeName: "1.1 KB",
    };
  });

  it("Convert from empty", () => {
    const data = new AttachmentData();
    const attachment = new Attachment(data);

    expect(attachment).toEqual({
      id: null,
      url: null,
      size: undefined,
      sizeName: null,
      key: null,
      fileName: null,
    });
  });

  it("Convert", () => {
    const attachment = new Attachment(data);

    expect(attachment).toEqual({
      size: "1100",
      id: "id",
      url: "url",
      sizeName: "1.1 KB",
      fileName: { encryptedString: "fileName", encryptionType: 0 },
      key: { encryptedString: "key", encryptionType: 0 },
    });
  });

  it("toAttachmentData", () => {
    const attachment = new Attachment(data);
    expect(attachment.toAttachmentData()).toEqual(data);
  });

  describe("decrypt", () => {
    let cryptoService: MockProxy<CryptoService>;
    let encryptService: MockProxy<EncryptService>;

    beforeEach(() => {
      cryptoService = mock<CryptoService>();
      encryptService = mock<EncryptService>();

      (window as any).bitwardenContainerService = new ContainerService(
        cryptoService,
        encryptService,
      );
    });

    it("expected output", async () => {
      const attachment = new Attachment();
      attachment.id = "id";
      attachment.url = "url";
      attachment.size = "1100";
      attachment.sizeName = "1.1 KB";
      attachment.key = mockEnc("key");
      attachment.fileName = mockEnc("fileName");

      encryptService.decryptToBytes.mockResolvedValue(makeStaticByteArray(32));

      const view = await attachment.decrypt(null);

      expect(view).toEqual({
        id: "id",
        url: "url",
        size: "1100",
        sizeName: "1.1 KB",
        fileName: "fileName",
        key: expect.any(SymmetricCryptoKey),
      });
    });

    describe("decrypts attachment.key", () => {
      let attachment: Attachment;

      beforeEach(() => {
        attachment = new Attachment();
        attachment.key = mock<EncString>();
      });

      it("uses the provided key without depending on CryptoService", async () => {
        const providedKey = mock<SymmetricCryptoKey>();

        await attachment.decrypt(null, providedKey);

        expect(cryptoService.getUserKeyWithLegacySupport).not.toHaveBeenCalled();
        expect(encryptService.decryptToBytes).toHaveBeenCalledWith(attachment.key, providedKey);
      });

      it("gets an organization key if required", async () => {
        const orgKey = mock<OrgKey>();
        cryptoService.getOrgKey.calledWith("orgId").mockResolvedValue(orgKey);

        await attachment.decrypt("orgId", null);

        expect(cryptoService.getOrgKey).toHaveBeenCalledWith("orgId");
        expect(encryptService.decryptToBytes).toHaveBeenCalledWith(attachment.key, orgKey);
      });

      it("gets the user's decryption key if required", async () => {
        const userKey = mock<UserKey>();
        cryptoService.getUserKeyWithLegacySupport.mockResolvedValue(userKey);

        await attachment.decrypt(null, null);

        expect(cryptoService.getUserKeyWithLegacySupport).toHaveBeenCalled();
        expect(encryptService.decryptToBytes).toHaveBeenCalledWith(attachment.key, userKey);
      });
    });
  });

  describe("fromJSON", () => {
    it("initializes nested objects", () => {
      jest.spyOn(EncString, "fromJSON").mockImplementation(mockFromJson);

      const actual = Attachment.fromJSON({
        key: "myKey" as EncryptedString,
        fileName: "myFileName" as EncryptedString,
      });

      expect(actual).toEqual({
        key: "myKey_fromJSON",
        fileName: "myFileName_fromJSON",
      });
      expect(actual).toBeInstanceOf(Attachment);
    });

    it("returns null if object is null", () => {
      expect(Attachment.fromJSON(null)).toBeNull();
    });
  });
});
