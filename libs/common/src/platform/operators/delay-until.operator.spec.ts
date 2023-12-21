import { TestScheduler } from "rxjs/testing";

import { delayUntil } from "./delay-until.operator";

describe("delayUntil", () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("should delay forever if the delay source never emits", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a--b--c---|");
      const delaySource = cold<void>("  -----------|");
      const expected = "                -----------|";

      expectObservable(e1.pipe(delayUntil(delaySource))).toBe(expected);
    });
  });

  it("should delay until the delay source emits", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a---------|");
      const delaySource = cold<void>("  --1--------|");
      const expected = "                --a--------|";

      expectObservable(e1.pipe(delayUntil(delaySource))).toBe(expected);
    });
  });

  it("should repeat any values emitted by the source after the delay source emits", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a--b--c---|");
      const delaySource = cold<void>("  --1--------|");
      const expected = "                --a-b--c---|";

      expectObservable(e1.pipe(delayUntil(delaySource))).toBe(expected);
    });
  });

  it("should emit all delayed values when the delay source emits", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a-b---c------|");
      const delaySource = cold<void>("  --------1-----|");
      const expected = "                --------(abc)-|"; // emissions on a single frame () implies skipped frames in marble diagram

      expectObservable(e1.pipe(delayUntil(delaySource))).toBe(expected);
    });
  });

  it("should not re-emit its buffer if delay source is called multiple times", () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const e1 = cold("                 -a-b---c------------|");
      const delaySource = cold<void>("  --------1--------2--|");
      const expected = "                --------(abc)-------|"; // emissions on a single frame () implies skipped frames in marble diagram

      expectObservable(e1.pipe(delayUntil(delaySource))).toBe(expected);
    });
  });

  it("should unsubscribe from the source", () => {
    testScheduler.run((helpers) => {
      const { cold, expectSubscriptions } = helpers;
      const e1 = cold("                 -a--b--c---|");
      const delaySource = cold<void>("  --1--------|");
      const delaySourceSubs = "         ^----------!";

      e1.pipe(delayUntil(delaySource)).subscribe().unsubscribe();

      expectSubscriptions(delaySource.subscriptions).toBe(delaySourceSubs);
    });
  });
});
