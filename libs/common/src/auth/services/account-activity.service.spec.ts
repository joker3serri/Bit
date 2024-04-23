import { firstValueFrom, of } from "rxjs";

import { FakeGlobalState, FakeGlobalStateProvider } from "../../../spec";
import { UserId } from "../../types/guid";
import { AccountActivityService } from "../abstractions/account-activity.service";

import { ACCOUNT_ACTIVITY, DefaultAccountActivityService } from "./account-activity.service";

describe("AccountActivityService", () => {
  let globalStateProvider: FakeGlobalStateProvider;
  let state: FakeGlobalState<Record<UserId, Date>>;

  let sut: AccountActivityService;

  beforeEach(() => {
    globalStateProvider = new FakeGlobalStateProvider();
    state = globalStateProvider.getFake(ACCOUNT_ACTIVITY);

    sut = new DefaultAccountActivityService(globalStateProvider);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("accountActivity$", () => {
    it("returns the account activity state", async () => {
      state.stateSubject.next({
        [toId("user1")]: new Date(1),
        [toId("user2")]: new Date(2),
      });

      await expect(firstValueFrom(sut.accountActivity$)).resolves.toEqual({
        [toId("user1")]: new Date(1),
        [toId("user2")]: new Date(2),
      });
    });

    it("returns an empty object when account activity is null", async () => {
      state.stateSubject.next(null);

      await expect(firstValueFrom(sut.accountActivity$)).resolves.toEqual({});
    });
  });

  describe("sortedUserIds$", () => {
    it("returns the sorted user ids by date", async () => {
      state.stateSubject.next({
        [toId("user1")]: new Date(3),
        [toId("user2")]: new Date(2),
        [toId("user3")]: new Date(1),
      });

      await expect(firstValueFrom(sut.sortedUserIds$)).resolves.toEqual([
        "user3" as UserId,
        "user2" as UserId,
        "user1" as UserId,
      ]);
    });

    it("returns an empty array when account activity is null", async () => {
      state.stateSubject.next(null);

      await expect(firstValueFrom(sut.sortedUserIds$)).resolves.toEqual([]);
    });
  });

  describe("nextUpActiveAccount", () => {
    beforeEach(() => {
      state.stateSubject.next({
        [toId("user1")]: new Date(1),
        [toId("user2")]: new Date(2),
        [toId("user3")]: new Date(3),
      });
    });

    it("returns returns the next most recent account when active is most recent", async () => {
      const currentUser = of("user1" as UserId);

      await expect(firstValueFrom(sut.nextUpActiveAccount(currentUser))).resolves.toBe(
        "user2" as UserId,
      );
    });

    it("returns most recent account when active is not most recent", async () => {
      const currentUser = of("user2" as UserId);

      await expect(firstValueFrom(sut.nextUpActiveAccount(currentUser))).resolves.toBe(
        "user1" as UserId,
      );
    });

    it("returns the most recent account when active is null", async () => {
      const currentUser = of(null);

      await expect(firstValueFrom(sut.nextUpActiveAccount(currentUser))).resolves.toBe(
        "user1" as UserId,
      );
    });

    it("returns null when there are no accounts", async () => {
      state.stateSubject.next({});

      const currentUser = of(null);

      await expect(firstValueFrom(sut.nextUpActiveAccount(currentUser))).resolves.toBe(null);
    });

    it("returns null when there are no accounts but there is an active account", async () => {
      state.stateSubject.next({});

      const currentUser = of("user1" as UserId);

      await expect(firstValueFrom(sut.nextUpActiveAccount(currentUser))).resolves.toBe(null);
    });

    it("returns null when account activity is null", async () => {
      state.stateSubject.next(null);

      const currentUser = of(null);

      await expect(firstValueFrom(sut.nextUpActiveAccount(currentUser))).resolves.toBe(null);
    });
  });

  describe("setAccountActivity", () => {
    it("sets the account activity", async () => {
      await sut.setAccountActivity("user1" as UserId, new Date(1));

      expect(state.nextMock).toHaveBeenCalledWith({ user1: new Date(1) });
    });

    it("does not update if the activity is the same", async () => {
      state.stateSubject.next({ [toId("user1")]: new Date(1) });

      await sut.setAccountActivity("user1" as UserId, new Date(1));

      expect(state.nextMock).not.toHaveBeenCalled();
    });
  });

  describe("removeAccountActivity", () => {
    it("removes the account activity", async () => {
      state.stateSubject.next({ [toId("user1")]: new Date(1) });

      await sut.removeAccountActivity("user1" as UserId);

      expect(state.nextMock).toHaveBeenCalledWith({});
    });

    it("does not update if the account activity is null", async () => {
      state.stateSubject.next(null);

      await sut.removeAccountActivity("user1" as UserId);

      expect(state.nextMock).not.toHaveBeenCalled();
    });

    it("does not update if the account activity is empty", async () => {
      state.stateSubject.next({});

      await sut.removeAccountActivity("user1" as UserId);

      expect(state.nextMock).not.toHaveBeenCalled();
    });

    it("does not update if the account activity does not contain the user", async () => {
      state.stateSubject.next({ [toId("user2")]: new Date(1) });

      await sut.removeAccountActivity("user1" as UserId);

      expect(state.nextMock).not.toHaveBeenCalled();
    });
  });
});

function toId(userId: string) {
  return userId as UserId;
}
