import {
  FakeAccountService,
  mockAccountServiceWith,
} from "@bitwarden/common/../spec/fake-account-service";
import { FakeStateProvider } from "@bitwarden/common/../spec/fake-state-provider";
import { Jsonify } from "type-fest";

import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { UserId } from "@bitwarden/common/types/guid";

import { BrowserComponentState } from "../../../models/browserComponentState";
import { BrowserSendComponentState } from "../../../models/browserSendComponentState";

import {
  BROWSER_SEND_COMPONENT,
  BROWSER_SEND_TYPE_COMPONENT,
  BrowserSendStateService,
} from "./browser-send-state.service";

describe("Browser Send State Service", () => {
  let stateProvider: FakeStateProvider;

  let accountService: FakeAccountService;
  let stateService: BrowserSendStateService;
  const mockUserId = Utils.newGuid() as UserId;

  beforeEach(() => {
    accountService = mockAccountServiceWith(mockUserId);
    stateProvider = new FakeStateProvider(accountService);

    stateService = new BrowserSendStateService(stateProvider);
  });

  describe("getBrowserSendComponentState", () => {
    it("should return a BrowserSendComponentState", async () => {
      await stateService.setBrowserSendComponentState(new BrowserSendComponentState());

      const actual = await stateService.getBrowserSendComponentState();

      expect(actual).toBeInstanceOf(BrowserSendComponentState);
    });

    it("should deserialize BrowserSendComponentState", () => {
      const keyDef = BROWSER_SEND_COMPONENT;

      const expectedState = {
        typeCounts: new Map<SendType, number>(),
      };

      const result = keyDef.deserializer(
        JSON.parse(JSON.stringify(expectedState)) as Jsonify<BrowserSendComponentState>,
      );

      expect(result).toEqual(expectedState);
    });

    it("should return BrowserSendComponentState", async () => {
      const state = new BrowserSendComponentState();
      state.scrollY = 0;
      state.searchText = "test";
      state.typeCounts = new Map<SendType, number>().set(SendType.File, 1);

      await stateService.setBrowserSendComponentState(state);

      const actual = await stateService.getBrowserSendComponentState();
      expect(actual).toStrictEqual(state);
    });
  });

  describe("getBrowserSendTypeComponentState", () => {
    it("should return BrowserComponentState", async () => {
      await stateService.setBrowserSendTypeComponentState(new BrowserComponentState());

      const actual = await stateService.getBrowserSendTypeComponentState();

      expect(actual).toBeInstanceOf(BrowserComponentState);
    });
  });

  it("should deserialize BrowserComponentState", () => {
    const keyDef = BROWSER_SEND_TYPE_COMPONENT;

    const expectedState = {
      scrollY: 0,
      searchText: "test",
    };

    const result = keyDef.deserializer(JSON.parse(JSON.stringify(expectedState)));

    expect(result).toEqual(expectedState);
  });

  it("should return BrowserComponentState", async () => {
    const state = new BrowserComponentState();
    state.scrollY = 0;
    state.searchText = "test";

    await stateService.setBrowserSendTypeComponentState(state);

    const actual = await stateService.getBrowserSendTypeComponentState();
    expect(actual).toStrictEqual(state);
  });
});
