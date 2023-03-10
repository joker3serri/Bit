import {
  BehaviorSubject,
  distinctUntilChanged,
  from,
  Observable,
  OperatorFunction,
  switchMap,
  tap,
} from "rxjs";

/**
 * Utility class to simplify re-fetching and tracking of loading states when
 * using "one-shot" data fetching, such as promises, or observables that end
 * in HTTP requests.
 *
 * Note: Make sure that all tracked observables have the same lifetime as
 * {@link RefreshTracker} or you will encounter issues with memory leaks.
 *
 * @example
 * ```
 * Component({
 *   template:
 *     <ng-container *ngIf="refreshTracker.loading$ | async">
 *       Loading...
 *     </ng-container>
 *   `
 * })
 * class Component {
 *   protected ciphers$: Observable<CipherView[]>;
 *   protected refreshTracker = new RefreshTracker();
 *
 *   private refresh$ = new Subject<void>();
 *
 *   ngOnInit() {
 *     this.ciphers$ = refresh$.pipe(
 *       refreshTracker.switchMap(() => this.cipherService.getAllDecrypted())
 *     );
 *   }
 *
 *   async onSomeUserAction() {
 *     await this.editCipherSomehow();
 *     this.refresh$.next();
 *   }
 * }
 * ```
 */
export class RefreshTracker {
  private map = new Map<symbol, boolean>();
  private readonly _loading$: BehaviorSubject<boolean>;

  /**
   * Observable emitting the aggregate state of all tracked operators.
   * True if any of the tracked operators are currently processing a request.
   */
  readonly loading$: Observable<boolean>;

  constructor() {
    this._loading$ = new BehaviorSubject(false);
    this.loading$ = this._loading$.pipe(distinctUntilChanged());
  }

  /**
   * Observable operator that tracks loading state using input and outputs.
   * Each emit by the upstream observable will cause this operator to be
   * marked as loading. It will stay in that state until the inner observable or
   * promise emits a value.
   */
  switchMap<T, R>(
    innerObservableOrPromise: (input: T) => Observable<R> | Promise<R>
  ): OperatorFunction<T, R> {
    const instanceId = Symbol();
    return (source$: Observable<T>): Observable<R> => {
      return source$.pipe(
        tap({ next: () => this.update(instanceId, true) }),
        switchMap((input) => {
          const innerObservable = from(innerObservableOrPromise(input));
          return innerObservable.pipe(
            tap({
              next: () => this.update(instanceId, false),
              error: () => this.update(instanceId, false),
              complete: () => this.update(instanceId, false),
            })
          );
        })
      );
    };
  }

  private update(instanceId: symbol, status: boolean) {
    this.map.set(instanceId, status);
    const allLoading = Array.from(this.map.values()).some((l) => l === true);
    this._loading$.next(allLoading);
  }
}
