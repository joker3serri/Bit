import { BehaviorSubject, Observable, ReplaySubject, Subscription, concatMap } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { DeriveDefinition, derivedKeyBuilder } from "../derivation-definition";
import { DerivedState } from "../derived-state";

/**
 * Default derived state
 */
export class DefaultDerivedState<TFrom, TTo, TDeps extends Record<string, Type<unknown>>>
  implements DerivedState<TTo>
{
  private readonly storageKey: string;
  private parentStateSubscription: Subscription;
  private stateSubject = new ReplaySubject<TTo>(1);
  private subscriberCount = new BehaviorSubject<number>(0);
  private stateObservable: Observable<TTo> | null = null;
  private reinitialize = false;

  get state$() {
    this.stateObservable = this.stateObservable ?? this.initializeObservable();
    return this.stateObservable;
  }

  constructor(
    private parentState$: Observable<TFrom>,
    private deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    private memoryStorage: AbstractStorageService & ObservableStorageService,
    private dependencies: ShapeToInstances<TDeps>,
  ) {
    this.storageKey = derivedKeyBuilder(deriveDefinition);
  }

  async forceValue(value: TTo) {
    await this.memoryStorage.save(this.storageKey, value);
    this.stateSubject.next(value);
    return value;
  }

  private initializeObservable() {
    this.parentStateSubscription = this.parentState$
      .pipe(
        concatMap(async (state) => {
          let derivedStateOrPromise = this.deriveDefinition.derive(state, this.dependencies);
          if (derivedStateOrPromise instanceof Promise) {
            derivedStateOrPromise = await derivedStateOrPromise;
          }
          const derivedState = derivedStateOrPromise;
          await this.memoryStorage.save(this.storageKey, derivedState);
          return derivedState;
        }),
      )
      .subscribe((derivedState) => this.stateSubject.next(derivedState));

    this.subscriberCount.subscribe((count) => {
      if (count === 0 && this.stateObservable != null) {
        this.triggerCleanup();
      }
    });

    return new Observable<TTo>((subscriber) => {
      this.incrementSubscribers();

      if (this.reinitialize) {
        this.reinitialize = false;
        this.initializeObservable();
      }

      const prevUnsubscribe = subscriber.unsubscribe.bind(subscriber);
      subscriber.unsubscribe = () => {
        prevUnsubscribe();
        this.decrementSubscribers();
      };

      return this.stateSubject.subscribe(subscriber);
    });
  }

  private incrementSubscribers() {
    this.subscriberCount.next(this.subscriberCount.value + 1);
  }

  private decrementSubscribers() {
    this.subscriberCount.next(this.subscriberCount.value - 1);
  }

  private triggerCleanup() {
    setTimeout(() => {
      if (this.subscriberCount.value === 0) {
        this.stateSubject.complete();
        this.stateSubject = new ReplaySubject<TTo>(1);
        this.parentStateSubscription.unsubscribe();
        this.subscriberCount.complete();
        this.subscriberCount = new BehaviorSubject<number>(0);
        this.reinitialize = true;
      }
    }, this.deriveDefinition.cleanupDelayMs);
  }
}
