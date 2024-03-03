import { mock } from "jest-mock-extended";

import { FakeSingleUserStateProvider, FakeGlobalStateProvider } from "../../../spec";
import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";
import { StorageLocation } from "../../platform/enums";
import { StorageOptions } from "../../platform/models/domain/storage-options";
import { UserId } from "../../types/guid";

import { ACCOUNT_ACTIVE_ACCOUNT_ID } from "./account.service";
import { TokenService } from "./token.service";
import {
  ACCESS_TOKEN_DISK,
  ACCESS_TOKEN_MEMORY,
  ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE,
  EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL,
} from "./token.state";

describe("TokenService", () => {
  let tokenService: TokenService;
  let singleUserStateProvider: FakeSingleUserStateProvider;
  let globalStateProvider: FakeGlobalStateProvider;

  const secureStorageService = mock<AbstractStorageService>();

  const memoryVaultTimeoutAction = VaultTimeoutAction.LogOut;
  const memoryVaultTimeout = 30;

  const diskVaultTimeoutAction = VaultTimeoutAction.Lock;
  const diskVaultTimeout: number = null;

  const accessTokenJwt =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6IkY5NjBFQzY4RThEMTBDMUEzNEE0OUYwODkwQkExQkExMDk4QUIzMjFSUzI1NiIsIng1dCI6Ii1XRHNhT2pSREJvMHBKOElrTG9ib1FtS3N5RSIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwibmJmIjoxNzA5MzI0MTExLCJpYXQiOjE3MDkzMjQxMTEsImV4cCI6MTcwOTMyNzcxMSwic2NvcGUiOlsiYXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbIkFwcGxpY2F0aW9uIl0sImNsaWVudF9pZCI6IndlYiIsInN1YiI6ImVjZTcwYTEzLTcyMTYtNDNjNC05OTc3LWIxMDMwMTQ2ZTFlNyIsImF1dGhfdGltZSI6MTcwOTMyNDEwNCwiaWRwIjoiYml0d2FyZGVuIiwicHJlbWl1bSI6ZmFsc2UsImVtYWlsIjoianNuaWRlclx1MDAyQmxvY2FsQGJpdHdhcmRlbi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInNzdGFtcCI6IkdZN0pBTzY0Q0tLVEtCQjZaRUFVWUwyV09RVTdBU1QyIiwibmFtZSI6IkphcmVkIFNuaWRlciAxIiwib3Jnb3duZXIiOlsiOTJiNDk5MDgtYjUxNC00NWE4LWJhZGItYjEwMzAxNDhmZTUzIiwiMzhlZGUzMjItYjRiNC00YmQ4LTllMDktYjEwNzAxMTJkYzExIiwiYjJkMDcwMjgtYTU4My00YzNlLThkNjAtYjEwNzAxMTk4YzI5IiwiYmY5MzRiYTItMGZkNC00OWYyLWE5NWUtYjEwNzAxMWZjOWU2IiwiYzBiN2Y3NWQtMDE1Zi00MmM5LWIzYTYtYjEwODAxNzYwN2NhIl0sImRldmljZSI6IjRiODcyMzY3LTBkYTYtNDFhMC1hZGNiLTc3ZjJmZWVmYzRmNCIsImp0aSI6Ijc1MTYxQkU0MTMxRkY1QTJERTUxMUI4QzRFMkZGODlBIn0.g-18EOexIbt7YIFW_D79Ilxe5-ZwTVjmFM5aRcLGyDnQZTXihBzYewzOPbQDoz0hdZF-LM8p94-45uYO3TgAUcYe6yOIpL6naJ7yNW8x_AU_Hc2FAChfV5N9mW7vzKkc_SJvHqyMifj6XGDpIwMAUY9U_WbFpPnkF9yO0moLBq5vtOrcnNSarou9kp4mQhf1KR123onO4SnMNrxyht9YWayCA0EyIjMoglQgJo_ecsJrkLCt0va9Xbx6hqYz_cDrcIvLq7NQkIe-ehHAZikTSqB9xaYpx5luWMyE0Wqw_Os47xpH-N56p8bGWPpoEhrDJKaZyl-Hn8--aGcBEu80zgAFKjARNsZzVm1g4UZcrgCOqyYQQi6JkKzIZ8ogGsEEeJSf_FFa0t9k7OFe2vvpfBRpB1OX1-O1hmUFFvX4k1MNd0TsrZSUZe_zwiMoGKsR182TPSdZlc7ucq7mt9oLPzCoJnyDxvm_fjQMaRKa6ITnnuNvA0I8qwqXO-Ga3hb2NZjrzaKh2iZAMlKHZohseX7gtxFh6r6ORgWDd-eUKnCJbLbNtcwQXH_XqPLqLldfdJA27V76GOBJypSqHNqBWYx6CYqCcihyM56SHkomUPcxdjuIZqpWUKKnevuIT_v5da5VnmP0TLi88ZdIjRGCVu9Cipx56dru_wwF_Um9304";

  const accessTokenDecoded = {
    iss: "http://localhost",
    nbf: 1709324111,
    iat: 1709324111,
    exp: 1709327711,
    scope: ["api", "offline_access"],
    amr: ["Application"],
    client_id: "web",
    sub: "ece70a13-7216-43c4-9977-b1030146e1e7", // user id
    auth_time: 1709324104,
    idp: "bitwarden",
    premium: false,
    email: "jsnider+local@bitwarden.com",
    email_verified: false,
    sstamp: "GY7JAO64CKKTKBB6ZEAUYL2WOQU7AST2",
    name: "Jared Snider 1",
    orgowner: [
      "92b49908-b514-45a8-badb-b1030148fe53",
      "38ede322-b4b4-4bd8-9e09-b1070112dc11",
      "b2d07028-a583-4c3e-8d60-b10701198c29",
      "bf934ba2-0fd4-49f2-a95e-b107011fc9e6",
      "c0b7f75d-015f-42c9-b3a6-b108017607ca",
    ],
    device: "4b872367-0da6-41a0-adcb-77f2feefc4f4",
    jti: "75161BE4131FF5A2DE511B8C4E2FF89A",
  };

  const userIdFromAccessToken: UserId = accessTokenDecoded.sub as UserId;

  beforeEach(() => {
    jest.clearAllMocks();

    singleUserStateProvider = new FakeSingleUserStateProvider();
    globalStateProvider = new FakeGlobalStateProvider();

    const supportsSecureStorage = false; // default to false; tests will override as needed
    tokenService = createTokenService(supportsSecureStorage);
  });

  it("instantiates", () => {
    expect(tokenService).not.toBeFalsy();
  });

  describe("Access Token methods", () => {
    const accessTokenPartialSecureStorageKey = `_accessToken`;
    const accessTokenSecureStorageKey = `${userIdFromAccessToken}${accessTokenPartialSecureStorageKey}`;

    const accessTokenSecureStorageOptions: StorageOptions = {
      storageLocation: StorageLocation.Disk,
      useSecureStorage: true,
      userId: userIdFromAccessToken,
    };

    describe("setAccessToken", () => {
      it("should throw an error if no user id is provided, there is no active user in global state, and an invalid token is passed in", async () => {
        // Act
        const result = tokenService.setAccessToken("invalidToken", VaultTimeoutAction.Lock, null);
        // Assert
        await expect(result).rejects.toThrow("JWT must have 3 parts");
      });

      it("should not throw an error if no user id is provided and there is no active user in global state as long as the token is valid", async () => {
        // Act
        const result = tokenService.setAccessToken(accessTokenJwt, VaultTimeoutAction.Lock, null);
        // Assert
        await expect(result).resolves.not.toThrow();
      });

      describe("Memory storage tests", () => {
        it("should set the access token in memory", async () => {
          // Act
          await tokenService.setAccessToken(
            accessTokenJwt,
            memoryVaultTimeoutAction,
            memoryVaultTimeout,
          );
          // Assert
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY).nextMock,
          ).toHaveBeenCalledWith(accessTokenJwt);
        });
      });

      describe("Disk storage tests (secure storage not supported on platform)", () => {
        it("should set the access token in disk", async () => {
          // Act
          await tokenService.setAccessToken(
            accessTokenJwt,
            diskVaultTimeoutAction,
            diskVaultTimeout,
          );
          // Assert
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK).nextMock,
          ).toHaveBeenCalledWith(accessTokenJwt);
        });
      });

      describe("Disk storage tests (secure storage supported on platform)", () => {
        beforeEach(() => {
          const supportsSecureStorage = true;
          tokenService = createTokenService(supportsSecureStorage);
        });

        it("should set the access token in secure storage, null out data on disk or in memory, and set a flag to indicate the token has been migrated", async () => {
          // Arrange:

          // For testing purposes, let's assume that the access token is already in disk and memory
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Act
          await tokenService.setAccessToken(
            accessTokenJwt,
            diskVaultTimeoutAction,
            diskVaultTimeout,
          );
          // Assert

          // assert that the access token was set in secure storage
          expect(secureStorageService.save).toHaveBeenCalledWith(
            accessTokenSecureStorageKey,
            accessTokenJwt,
            accessTokenSecureStorageOptions,
          );

          // assert data was migrated out of disk and memory + flag was set
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK).nextMock,
          ).toHaveBeenCalledWith(null);
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY).nextMock,
          ).toHaveBeenCalledWith(null);

          expect(
            singleUserStateProvider.getFake(
              userIdFromAccessToken,
              ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE,
            ).nextMock,
          ).toHaveBeenCalledWith(true);
        });
      });
    });

    describe("getAccessToken", () => {
      it("should throw an error if no user id is provided and there is no active user in global state", async () => {
        // Act
        const result = tokenService.getAccessToken();
        // Assert
        await expect(result).rejects.toThrow("User id not found. Cannot get access token.");
      });

      describe("Memory storage tests", () => {
        it("should get the access token from memory with no user id specified (uses global active user)", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // TODO: ask platform why this isn't supported; if I set this, then memory returns undefined.
          // set disk to undefined
          // singleUserStateProvider
          //   .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
          //   .stateSubject.next([userIdFromAccessToken, undefined]);

          // Need to have global active id set to the user id
          globalStateProvider
            .getFake(ACCOUNT_ACTIVE_ACCOUNT_ID)
            .stateSubject.next(userIdFromAccessToken);

          // Act
          const result = await tokenService.getAccessToken();

          // Assert
          expect(result).toEqual(accessTokenJwt);

          // TODO: this isn't the best way to handle this. Remove this once we can set the disk to undefined.
          // assert disk was not called
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK).nextMock,
          ).not.toHaveBeenCalled();
        });

        it("should get the access token from memory for the specified user id", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Act
          const result = await tokenService.getAccessToken(userIdFromAccessToken);
          // Assert
          expect(result).toEqual(accessTokenJwt);

          // TODO: this isn't the best way to handle this. Remove this once we can set the disk to undefined.
          // assert disk was not called
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK).nextMock,
          ).not.toHaveBeenCalled();
        });
      });

      describe("Disk storage tests (secure storage not supported on platform)", () => {
        it("should get the access token from disk with no user id specified", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Need to have global active id set to the user id
          globalStateProvider
            .getFake(ACCOUNT_ACTIVE_ACCOUNT_ID)
            .stateSubject.next(userIdFromAccessToken);

          // Act
          const result = await tokenService.getAccessToken();
          // Assert
          expect(result).toEqual(accessTokenJwt);
        });

        it("should get the access token from disk for the specified user id", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Act
          const result = await tokenService.getAccessToken(userIdFromAccessToken);
          // Assert
          expect(result).toEqual(accessTokenJwt);
        });
      });

      describe("Disk storage tests (secure storage supported on platform)", () => {
        beforeEach(() => {
          const supportsSecureStorage = true;
          tokenService = createTokenService(supportsSecureStorage);
        });

        it("should get the access token from secure storage when no user id is specified and the migration flag is set to true", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          secureStorageService.get.mockResolvedValue(accessTokenJwt);

          // Need to have global active id set to the user id
          globalStateProvider
            .getFake(ACCOUNT_ACTIVE_ACCOUNT_ID)
            .stateSubject.next(userIdFromAccessToken);

          // set access token migration flag to true
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE)
            .stateSubject.next([userIdFromAccessToken, true]);

          // Act
          const result = await tokenService.getAccessToken();
          // Assert
          expect(result).toEqual(accessTokenJwt);
        });

        it("should get the access token from secure storage when user id is specified and the migration flag set to true", async () => {
          // Arrange

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          secureStorageService.get.mockResolvedValue(accessTokenJwt);

          // set access token migration flag to true
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE)
            .stateSubject.next([userIdFromAccessToken, true]);

          // Act
          const result = await tokenService.getAccessToken(userIdFromAccessToken);
          // Assert
          expect(result).toEqual(accessTokenJwt);
        });

        it("should fallback and get the access token from disk when user id is specified and the migration flag is set to false even if the platform supports secure storage", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // set access token migration flag to false
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE)
            .stateSubject.next([userIdFromAccessToken, false]);

          // Act
          const result = await tokenService.getAccessToken(userIdFromAccessToken);

          // Assert
          expect(result).toEqual(accessTokenJwt);

          // assert that secure storage was not called
          expect(secureStorageService.get).not.toHaveBeenCalled();
        });

        it("should fallback and get the access token from disk when no user id is specified and the migration flag is set to false even if the platform supports secure storage", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, undefined]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Need to have global active id set to the user id
          globalStateProvider
            .getFake(ACCOUNT_ACTIVE_ACCOUNT_ID)
            .stateSubject.next(userIdFromAccessToken);

          // set access token migration flag to false
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE)
            .stateSubject.next([userIdFromAccessToken, false]);

          // Act
          const result = await tokenService.getAccessToken();

          // Assert
          expect(result).toEqual(accessTokenJwt);

          // assert that secure storage was not called
          expect(secureStorageService.get).not.toHaveBeenCalled();
        });
      });
    });

    describe("clearAccessTokenByUserId", () => {
      it(" should throw an error if no user id is provided and there is no active user in global state", async () => {
        // Act
        const result = tokenService.clearAccessTokenByUserId();
        // Assert
        await expect(result).rejects.toThrow("User id not found. Cannot clear access token.");
      });

      describe("Secure storage enabled", () => {
        beforeEach(() => {
          const supportsSecureStorage = true;
          tokenService = createTokenService(supportsSecureStorage);
        });

        it("should clear the access token from all storage locations for the specified user id", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Act
          await tokenService.clearAccessTokenByUserId(userIdFromAccessToken);

          // Assert
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY).nextMock,
          ).toHaveBeenCalledWith(null);
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK).nextMock,
          ).toHaveBeenCalledWith(null);

          expect(secureStorageService.remove).toHaveBeenCalledWith(
            accessTokenSecureStorageKey,
            accessTokenSecureStorageOptions,
          );
        });

        it("should clear the access token from all storage locations for the global active user", async () => {
          // Arrange
          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          singleUserStateProvider
            .getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK)
            .stateSubject.next([userIdFromAccessToken, accessTokenJwt]);

          // Need to have global active id set to the user id
          globalStateProvider
            .getFake(ACCOUNT_ACTIVE_ACCOUNT_ID)
            .stateSubject.next(userIdFromAccessToken);

          // Act
          await tokenService.clearAccessTokenByUserId();

          // Assert
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_MEMORY).nextMock,
          ).toHaveBeenCalledWith(null);
          expect(
            singleUserStateProvider.getFake(userIdFromAccessToken, ACCESS_TOKEN_DISK).nextMock,
          ).toHaveBeenCalledWith(null);

          expect(secureStorageService.remove).toHaveBeenCalledWith(
            accessTokenSecureStorageKey,
            accessTokenSecureStorageOptions,
          );
        });
      });
    });
  });

  describe("setTokens", () => {
    it("should set all passed in tokens after deriving user id from the access token", async () => {
      // Arrange
      const refreshToken = "refreshToken";
      // specific vault timeout actions and vault timeouts don't change this test so values don't matter.
      const vaultTimeoutAction = VaultTimeoutAction.Lock;
      const vaultTimeout = 30;
      const clientId = "clientId";
      const clientSecret = "clientSecret";

      tokenService.setAccessToken = jest.fn();
      // any hack allows for mocking private method.
      (tokenService as any).setRefreshToken = jest.fn();
      tokenService.setClientId = jest.fn();
      tokenService.setClientSecret = jest.fn();

      // Act
      // Note: passing a valid access token so that a valid user id can be determined from the access token
      await tokenService.setTokens(accessTokenJwt, refreshToken, vaultTimeoutAction, vaultTimeout, [
        clientId,
        clientSecret,
      ]);

      // Assert
      expect(tokenService.setAccessToken).toHaveBeenCalledWith(
        accessTokenJwt,
        vaultTimeoutAction,
        vaultTimeout,
        userIdFromAccessToken,
      );

      // any hack allows for testing private methods
      expect((tokenService as any).setRefreshToken).toHaveBeenCalledWith(
        refreshToken,
        vaultTimeoutAction,
        vaultTimeout,
        userIdFromAccessToken,
      );

      expect(tokenService.setClientId).toHaveBeenCalledWith(
        clientId,
        vaultTimeoutAction,
        vaultTimeout,
        userIdFromAccessToken,
      );
      expect(tokenService.setClientSecret).toHaveBeenCalledWith(
        clientSecret,
        vaultTimeoutAction,
        vaultTimeout,
        userIdFromAccessToken,
      );
    });

    it("should not try to set client id and client secret if they are not passed in", async () => {
      // Arrange
      const refreshToken = "refreshToken";
      const vaultTimeoutAction = VaultTimeoutAction.Lock;
      const vaultTimeout = 30;

      tokenService.setAccessToken = jest.fn();
      (tokenService as any).setRefreshToken = jest.fn();
      tokenService.setClientId = jest.fn();
      tokenService.setClientSecret = jest.fn();

      // Act
      await tokenService.setTokens(accessTokenJwt, refreshToken, vaultTimeoutAction, vaultTimeout);

      // Assert
      expect(tokenService.setAccessToken).toHaveBeenCalledWith(
        accessTokenJwt,
        vaultTimeoutAction,
        vaultTimeout,
        userIdFromAccessToken,
      );

      // any hack allows for testing private methods
      expect((tokenService as any).setRefreshToken).toHaveBeenCalledWith(
        refreshToken,
        vaultTimeoutAction,
        vaultTimeout,
        userIdFromAccessToken,
      );

      expect(tokenService.setClientId).not.toHaveBeenCalled();
      expect(tokenService.setClientSecret).not.toHaveBeenCalled();
    });

    it("should throw an error if the access token is invalid", async () => {
      // Arrange
      const accessToken = "invalidToken";
      const refreshToken = "refreshToken";
      const vaultTimeoutAction = VaultTimeoutAction.Lock;
      const vaultTimeout = 30;

      // Act
      const result = tokenService.setTokens(
        accessToken,
        refreshToken,
        vaultTimeoutAction,
        vaultTimeout,
      );

      // Assert
      await expect(result).rejects.toThrow("JWT must have 3 parts");
    });
  });

  describe("TwoFactorToken methods", () => {
    describe("setTwoFactorToken", () => {
      it("should set the email and two factor token when there hasn't been a previous record (initializing the record)", async () => {
        // Arrange
        const email = "testUser@email.com";
        const twoFactorToken = "twoFactorTokenForTestUser";
        // Act
        await tokenService.setTwoFactorToken(email, twoFactorToken);
        // Assert
        expect(
          globalStateProvider.getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL).nextMock,
        ).toHaveBeenCalledWith({ [email]: twoFactorToken });
      });

      it("should set the email and two factor token when there is an initialized value already (updating the existing record)", async () => {
        // Arrange
        const email = "testUser@email.com";
        const twoFactorToken = "twoFactorTokenForTestUser";
        const initialTwoFactorTokenRecord: Record<string, string> = {
          otherUser: "otherUserTwoFactorToken",
        };

        globalStateProvider
          .getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL)
          .stateSubject.next(initialTwoFactorTokenRecord);

        // Act
        await tokenService.setTwoFactorToken(email, twoFactorToken);

        // Assert
        expect(
          globalStateProvider.getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL).nextMock,
        ).toHaveBeenCalledWith({ [email]: twoFactorToken, ...initialTwoFactorTokenRecord });
      });
    });

    describe("getTwoFactorToken", () => {
      it("should return the two factor token for the given email", async () => {
        // Arrange
        const email = "testUser";
        const twoFactorToken = "twoFactorTokenForTestUser";
        const initialTwoFactorTokenRecord: Record<string, string> = {
          [email]: twoFactorToken,
        };

        globalStateProvider
          .getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL)
          .stateSubject.next(initialTwoFactorTokenRecord);

        // Act
        const result = await tokenService.getTwoFactorToken(email);

        // Assert
        expect(result).toEqual(twoFactorToken);
      });

      it("should not return the two factor token for an email that doesn't exist", async () => {
        // Arrange
        const email = "testUser";
        const initialTwoFactorTokenRecord: Record<string, string> = {
          otherUser: "twoFactorTokenForOtherUser",
        };

        globalStateProvider
          .getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL)
          .stateSubject.next(initialTwoFactorTokenRecord);

        // Act
        const result = await tokenService.getTwoFactorToken(email);

        // Assert
        expect(result).toEqual(undefined);
      });
    });
  });

  // Helpers
  function createTokenService(supportsSecureStorage: boolean) {
    return new TokenService(
      singleUserStateProvider,
      globalStateProvider,
      supportsSecureStorage,
      secureStorageService,
    );
  }
});
