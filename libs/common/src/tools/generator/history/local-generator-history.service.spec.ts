import { mock } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { FakeStateProvider, awaitAsync, mockAccountServiceWith } from "../../../../spec";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { CsprngArray } from "../../../types/csprng";
import { UserId } from "../../../types/guid";
import { UserKey } from "../../../types/key";

import { LocalGeneratorHistoryService } from "./local-generator-history.service";
import { HistoryServiceOptions } from "./options";

const SomeUser = "SomeUser" as UserId;
const AnotherUser = "AnotherUser" as UserId;

describe("LocalGeneratorHistoryService", () => {
  const encryptService = mock<EncryptService>();
  const keyService = mock<CryptoService>();
  const userKey = new SymmetricCryptoKey(new Uint8Array(64) as CsprngArray) as UserKey;
  const stateProvider = new FakeStateProvider(mockAccountServiceWith(SomeUser));

  beforeEach(() => {
    encryptService.encrypt.mockImplementation((p) => Promise.resolve(p as unknown as EncString));
    encryptService.decryptToUtf8.mockImplementation((c) => Promise.resolve(c.encryptedString));
    keyService.getUserKey.mockImplementation(() => Promise.resolve(userKey));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("credential$", () => {
    it("returns an empty list no credentials are stored", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

      const result = await firstValueFrom(history.credentials$(SomeUser));

      expect(result).toEqual([]);
    });
  });

  describe("track", () => {
    it("stores a credential", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

      await history.track(SomeUser, "example", "password");
      await awaitAsync();
      const result = await firstValueFrom(history.credentials$(SomeUser));

      expect(result).toMatchObject({ credential: "example", category: "password" });
    });

    it("", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });

    it("",async  () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });

    it("", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });
  });

  describe("take", () => {
    it("", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });

    it("", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });

    it("", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });

    it("", async () => {
      const history = new LocalGeneratorHistoryService(encryptService, keyService, stateProvider);

    });
  });
})
