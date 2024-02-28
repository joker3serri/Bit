import { mock } from "jest-mock-extended";

import { FakeSingleUserStateProvider, FakeGlobalStateProvider } from "../../../spec";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";

import { TokenService } from "./token.service";
import { EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL } from "./token.state";

describe("TokenService", () => {
  let tokenService: TokenService;

  let singleUserStateProvider: FakeSingleUserStateProvider;
  let globalStateProvider: FakeGlobalStateProvider;

  const platformUtilsService = mock<PlatformUtilsService>();
  const secureStorageService = mock<AbstractStorageService>();

  beforeEach(() => {
    jest.clearAllMocks();

    singleUserStateProvider = new FakeSingleUserStateProvider();
    globalStateProvider = new FakeGlobalStateProvider();

    tokenService = new TokenService(
      singleUserStateProvider,
      globalStateProvider,
      platformUtilsService,
      secureStorageService,
    );
  });

  it("instantiates", () => {
    expect(tokenService).not.toBeFalsy();
  });

  // TODO: tweak the names of the it blocks to be more descriptive around the fact that we are simply updating a single entry in a record
  describe("setTwoFactorToken", () => {
    it("should set the two factor token when there hasn't been one set yet (initializing the record)", async () => {
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

    it("should set the two factor token when there is an initialized value already", async () => {
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
});
