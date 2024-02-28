import { mock } from "jest-mock-extended";

import { FakeSingleUserStateProvider, FakeGlobalStateProvider } from "../../../spec";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";

import { TokenService } from "./token.service";

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
});
