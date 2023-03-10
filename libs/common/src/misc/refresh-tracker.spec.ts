import { lastValueFrom, Observable, reduce, Subject, take } from "rxjs";

import { RefreshTracker } from "./refresh-tracker";

describe("RefreshTracker", () => {
  let refresh$!: Subject<void>;
  let refreshTracker!: RefreshTracker;

  beforeEach(() => {
    refresh$ = new Subject();
    refreshTracker = new RefreshTracker();
  });

  describe("loading$", () => {
    it("should emit false when initalized", async () => {
      const result = await nValuesFrom(1, refreshTracker.loading$);

      expect(result).toEqual([false]);
    });

    it("should emit true when upstream emits and tracked observable has not emitted yet", async () => {
      const stream = nValuesFrom(2, refreshTracker.loading$);
      const tracked$ = new Subject<void>();
      refresh$.pipe(refreshTracker.switchMap(() => tracked$)).subscribe();
      refresh$.next();

      const result = await stream;

      expect(result).toEqual([false, true]);
    });

    it("should emit false when upstream emits and tracked observable has emitted", async () => {
      const stream = nValuesFrom(3, refreshTracker.loading$);
      const tracked$ = new Subject<void>();
      refresh$.pipe(refreshTracker.switchMap(() => tracked$)).subscribe();
      refresh$.next();
      tracked$.next();

      const result = await stream;

      expect(result).toEqual([false, true, false]);
    });

    it("should emit true when upstream emits and some tracked observables have not emitted yet", async () => {
      const stream = nValuesFrom(2, refreshTracker.loading$);
      const trackedA$ = new Subject<void>();
      const trackedB$ = new Subject<void>();
      refresh$.pipe(refreshTracker.switchMap(() => trackedA$)).subscribe();
      refresh$.pipe(refreshTracker.switchMap(() => trackedB$)).subscribe();
      refresh$.next();
      trackedA$.next();

      const result = await stream;

      expect(result).toEqual([false, true]);
    });

    it("should emit false when upstream emits and all tracked observable have emitted", async () => {
      const stream = nValuesFrom(3, refreshTracker.loading$);
      const trackedA$ = new Subject<void>();
      const trackedB$ = new Subject<void>();
      refresh$.pipe(refreshTracker.switchMap(() => trackedA$)).subscribe();
      refresh$.pipe(refreshTracker.switchMap(() => trackedB$)).subscribe();
      refresh$.next();
      trackedA$.next();
      trackedB$.next();

      const result = await stream;

      expect(result).toEqual([false, true, false]);
    });
  });
});

function nValuesFrom<T>(numberOfValues: number, observable: Observable<T>): Promise<T[]> {
  return lastValueFrom(
    observable.pipe(
      take(numberOfValues),
      reduce<T, T[]>((acc, value) => [...acc, value], [])
    )
  );
}
