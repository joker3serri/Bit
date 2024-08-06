import { BehaviorSubject, of, Subject } from "rxjs";

import { UserId } from "@bitwarden/common/types/guid";

import { awaitAsync, FakeSingleUserState } from "../../../spec";

import { UserStateSubject } from "./user-state-subject";

const SomeUser = "some user" as UserId;
type TestType = { foo: string };

describe("UserStateSubject", () => {
  describe("dependencies", () => {
    it("ignores repeated when$ emissions", async () => {
      // this test looks for `nextValue` because a subscription isn't necessary for
      // the subject to update
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const nextValue = jest.fn((_, next) => next);
      const when$ = new BehaviorSubject(true);
      const subject = new UserStateSubject(state, { singleUserId$, nextValue, when$ });

      // the interleaved await asyncs are only necessary b/c `nextValue` is called asynchronously
      subject.next({ foo: "next" });
      await awaitAsync();
      when$.next(true);
      await awaitAsync();
      when$.next(true);
      when$.next(true);
      await awaitAsync();

      expect(nextValue).toHaveBeenCalledTimes(1);
    });

    it("ignores repeated singleUserId$ emissions", async () => {
      // this test looks for `nextValue` because a subscription isn't necessary for
      // the subject to update
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const nextValue = jest.fn((_, next) => next);
      const when$ = new BehaviorSubject(true);
      const subject = new UserStateSubject(state, { singleUserId$, nextValue, when$ });

      // the interleaved await asyncs are only necessary b/c `nextValue` is called asynchronously
      subject.next({ foo: "next" });
      await awaitAsync();
      singleUserId$.next(SomeUser);
      await awaitAsync();
      singleUserId$.next(SomeUser);
      singleUserId$.next(SomeUser);
      await awaitAsync();

      expect(nextValue).toHaveBeenCalledTimes(1);
    });
  });

  describe("next", () => {
    it("emits the next value", async () => {
      const state = new FakeSingleUserState<TestType>(SomeUser, { foo: "init" });
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const subject = new UserStateSubject(state, { singleUserId$ });
      const expected: TestType = { foo: "next" };

      let actual: TestType = null;
      subject.subscribe((value) => {
        actual = value;
      });
      subject.next(expected);
      await awaitAsync();

      expect(actual).toEqual(expected);
    });

    it("evaluates shouldUpdate", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const shouldUpdate = jest.fn(() => true);
      const subject = new UserStateSubject(state, { singleUserId$, shouldUpdate });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();

      expect(shouldUpdate).toHaveBeenCalledWith(initialValue, nextVal, null);
    });

    it("evaluates shouldUpdate with a dependency", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const shouldUpdate = jest.fn(() => true);
      const dependencyValue = { bar: "dependency" };
      const subject = new UserStateSubject(state, {
        singleUserId$,
        shouldUpdate,
        dependencies$: of(dependencyValue),
      });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();

      expect(shouldUpdate).toHaveBeenCalledWith(initialValue, nextVal, dependencyValue);
    });

    it("emits a value when shouldUpdate returns `true`", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const shouldUpdate = jest.fn(() => true);
      const subject = new UserStateSubject(state, { singleUserId$, shouldUpdate });
      const expected: TestType = { foo: "next" };

      let actual: TestType = null;
      subject.subscribe((value) => {
        actual = value;
      });
      subject.next(expected);
      await awaitAsync();

      expect(actual).toEqual(expected);
    });

    it("retains the current value when shouldUpdate returns `false`", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const shouldUpdate = jest.fn(() => false);
      const subject = new UserStateSubject(state, { singleUserId$, shouldUpdate });

      subject.next({ foo: "next" });
      await awaitAsync();
      let actual: TestType = null;
      subject.subscribe((value) => {
        actual = value;
      });

      expect(actual).toEqual(initialValue);
    });

    it("evaluates nextValue", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const nextValue = jest.fn((_, next) => next);
      const subject = new UserStateSubject(state, { singleUserId$, nextValue });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();

      expect(nextValue).toHaveBeenCalledWith(initialValue, nextVal, null);
    });

    it("evaluates nextValue with a dependency", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const nextValue = jest.fn((_, next) => next);
      const dependencyValue = { bar: "dependency" };
      const subject = new UserStateSubject(state, {
        singleUserId$,
        nextValue,
        dependencies$: of(dependencyValue),
      });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();

      expect(nextValue).toHaveBeenCalledWith(initialValue, nextVal, dependencyValue);
    });

    it("evaluates nextValue when when$ is true", async () => {
      // this test looks for `nextValue` because a subscription isn't necessary for
      // the subject to update
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const nextValue = jest.fn((_, next) => next);
      const when$ = new BehaviorSubject(true);
      const subject = new UserStateSubject(state, { singleUserId$, nextValue, when$ });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();

      expect(nextValue).toHaveBeenCalled();
    });

    it("waits to evaluate nextValue until when$ is true", async () => {
      // this test looks for `nextValue` because a subscription isn't necessary for
      // the subject to update.
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const nextValue = jest.fn((_, next) => next);
      const when$ = new BehaviorSubject(false);
      const subject = new UserStateSubject(state, { singleUserId$, nextValue, when$ });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();
      expect(nextValue).not.toHaveBeenCalled();

      when$.next(true);
      await awaitAsync();
      expect(nextValue).toHaveBeenCalled();
    });

    it("waits to evaluate nextValue until singleUserId$ emits", async () => {
      // this test looks for `nextValue` because a subscription isn't necessary for
      // the subject to update.
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new Subject<UserId>();
      const nextValue = jest.fn((_, next) => next);
      const subject = new UserStateSubject(state, { singleUserId$, nextValue });

      const nextVal: TestType = { foo: "next" };
      subject.next(nextVal);
      await awaitAsync();
      expect(nextValue).not.toHaveBeenCalled();
      singleUserId$.next(SomeUser);
      await awaitAsync();

      expect(nextValue).toHaveBeenCalled();
    });
  });

  describe("error", () => {
    it("emits errors", async () => {
      const state = new FakeSingleUserState<TestType>(SomeUser, { foo: "init" });
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const subject = new UserStateSubject(state, { singleUserId$ });
      const expected: TestType = { foo: "error" };

      let actual: TestType = null;
      subject.subscribe({
        error: (value) => {
          actual = value;
        },
      });
      subject.error(expected);
      await awaitAsync();

      expect(actual).toEqual(expected);
    });
  });

  describe("complete", () => {
    it("emits completes", async () => {
      const state = new FakeSingleUserState<TestType>(SomeUser, { foo: "init" });
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const subject = new UserStateSubject(state, { singleUserId$ });

      let actual = false;
      subject.subscribe({
        complete: () => {
          actual = true;
        },
      });
      subject.complete();
      await awaitAsync();

      expect(actual).toBeTruthy();
    });
  });

  describe("subscribe", () => {
    it("completes when singleUserId$ completes", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const subject = new UserStateSubject(state, { singleUserId$ });

      let actual = false;
      subject.subscribe({
        complete: () => {
          actual = true;
        },
      });
      singleUserId$.complete();
      await awaitAsync();

      expect(actual).toBeTruthy();
    });

    it("completes when when$ completes", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const when$ = new BehaviorSubject(true);
      const subject = new UserStateSubject(state, { singleUserId$, when$ });

      let actual = false;
      subject.subscribe({
        complete: () => {
          actual = true;
        },
      });
      when$.complete();
      await awaitAsync();

      expect(actual).toBeTruthy();
    });

    it("errors when singleUserId$ errors", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const subject = new UserStateSubject(state, { singleUserId$ });
      const expected = { error: "description" };

      let actual = false;
      subject.subscribe({
        error: (e) => {
          actual = e;
        },
      });
      singleUserId$.error(expected);
      await awaitAsync();

      expect(actual).toEqual(expected);
    });

    it("errors when when$ errors", async () => {
      const initialValue: TestType = { foo: "init" };
      const state = new FakeSingleUserState<TestType>(SomeUser, initialValue);
      const singleUserId$ = new BehaviorSubject(SomeUser);
      const when$ = new BehaviorSubject(true);
      const subject = new UserStateSubject(state, { singleUserId$, when$ });
      const expected = { error: "description" };

      let actual = false;
      subject.subscribe({
        error: (e) => {
          actual = e;
        },
      });
      when$.error(expected);
      await awaitAsync();

      expect(actual).toEqual(expected);
    });
  });
});
