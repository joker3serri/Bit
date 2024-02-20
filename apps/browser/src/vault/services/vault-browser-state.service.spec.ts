import {
  FakeAccountService,
  mockAccountServiceWith,
} from "@bitwarden/common/../spec/fake-account-service";
import { FakeActiveUserState } from "@bitwarden/common/../spec/fake-state";
import { FakeStateProvider } from "@bitwarden/common/../spec/fake-state-provider";

import { Utils } from "@bitwarden/common/platform/misc/utils";
import { UserId } from "@bitwarden/common/types/guid";

import { BrowserComponentState } from "../../models/browserComponentState";
import { BrowserGroupingsComponentState } from "../../models/browserGroupingsComponentState";

import { VAULT_BROWSER_COMPONENT, VaultBrowserStateService } from "./vault-browser-state.service";

describe("Vault Browser State Service", () => {
  let stateProvider: FakeStateProvider;

  let browserState: FakeActiveUserState<BrowserComponentState>;

  let accountService: FakeAccountService;
  let stateService: VaultBrowserStateService;
  const mockUserId = Utils.newGuid() as UserId;

  beforeEach(() => {
    accountService = mockAccountServiceWith(mockUserId);
    stateProvider = new FakeStateProvider(accountService);

    browserState = stateProvider.activeUser.getFake(VAULT_BROWSER_COMPONENT);

    stateService = new VaultBrowserStateService(stateProvider);
  });

  describe("getBrowserGroupingComponentState", () => {
    it("should return a BrowserGroupingsComponentState", async () => {
      await stateService.setBrowserGroupingComponentState(new BrowserGroupingsComponentState());

      const actual = await stateService.getBrowserGroupingComponentState();
      expect(actual).toBeInstanceOf(BrowserGroupingsComponentState);
    });
  });

  describe("getBrowserVaultItemsComponentState", () => {
    it("should return a BrowserComponentState", async () => {
      const componentState = new BrowserComponentState();
      componentState.scrollY = 0;
      componentState.searchText = "test";

      browserState.nextState(componentState);

      const actual = await stateService.getBrowserVaultItemsComponentState();
      expect(actual).toStrictEqual(componentState);
    });
  });
});
