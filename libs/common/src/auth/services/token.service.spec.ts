import { mock } from "jest-mock-extended";

import { FakeSingleUserStateProvider, FakeGlobalStateProvider } from "../../../spec";
import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";

import { TokenService, TokenStorageLocation } from "./token.service";
import { EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL } from "./token.state";

type VaultTimeoutSettings = Partial<{
  [key in TokenStorageLocation]: {
    vaultTimeoutAction: VaultTimeoutAction;
    vaultTimeout: number | null;
  };
}>;

describe("TokenService", () => {
  let tokenService: TokenService;

  let singleUserStateProvider: FakeSingleUserStateProvider;
  let globalStateProvider: FakeGlobalStateProvider;

  const secureStorageService = mock<AbstractStorageService>();

  const vaultTimeoutSettings: VaultTimeoutSettings = {
    [TokenStorageLocation.Disk]: {
      vaultTimeoutAction: VaultTimeoutAction.Lock,
      vaultTimeout: null,
    },
    [TokenStorageLocation.Memory]: {
      vaultTimeoutAction: VaultTimeoutAction.LogOut,
      vaultTimeout: 30,
    },
  };

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

  // AccessToken logic
  describe("AccessToken logic", () => {
    // TODO: Need to break apart testing this into memory, disk, and secure storage tests

    describe("Memory storage tests", () => {
      const { vaultTimeoutAction, vaultTimeout } =
        vaultTimeoutSettings[TokenStorageLocation.Memory];

      // beforeEach(() => {
      // })

      it("should set the access token in memory", async () => {
        // TODO: must create valid access token that can be decoded.
        // Arrange
        const accessToken = "accessTokenForTestUser";
        // Act
        await tokenService.setAccessToken(accessToken, vaultTimeoutAction, vaultTimeout);
        // Assert
        expect(
          globalStateProvider.getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL).nextMock,
        ).toHaveBeenCalledWith({ accessToken });
      });
    });

    // describe("setAccessToken", () => {
    //   it("should set the access token ", async () => {
    //     // Arrange
    //     const accessToken = "accessTokenForTestUser";
    //     //
    //     // Act
    //     await tokenService.setAccessToken(accessToken);
    //     // Assert
    //     expect(
    //       globalStateProvider.getFake(EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL).nextMock,
    //     ).toHaveBeenCalledWith({ accessToken });
    //   });
    // });
  });

  describe("TwoFactorToken logic", () => {
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
