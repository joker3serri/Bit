import { MonoTypeOperatorFunction, Observable, filter } from "rxjs";

export function delayUntil<T>(delaySource: Observable<void>): MonoTypeOperatorFunction<T> {
  let delay = true;

  return function <T>(source: Observable<T>) {
    const buffer: T[] = [];

    return new Observable<T>((subscriber) => {
      const innerSubscription = delaySource.pipe(filter(() => delay)).subscribe(() => {
        buffer.forEach((value) => subscriber.next(value));
        delay = false;
      });
      source.subscribe({
        next(value) {
          if (delay) {
            buffer.push(value);
          } else {
            subscriber.next(value);
          }
        },
        error(err: unknown) {
          innerSubscription.unsubscribe();
          subscriber.error(err);
        },
        complete() {
          innerSubscription.unsubscribe();
          subscriber.complete();
        },
      });
    });
  };
}
