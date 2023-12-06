import { BehaviorSubject, Observable, filter, firstValueFrom, switchMap, timeout } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { GlobalState } from "../global-state";
import { KeyDefinition, globalKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";

import { getStoredValue } from "./util";
const FAKE_DEFAULT = Symbol("fakeDefault");

export class DefaultGlobalState<T> implements GlobalState<T> {
  // store all subscribers to count them
  // implement a destroy after x time if no subscribers
  // store new subscribers during update
  // update new subscribers if not update

  private storageKey: string;
  private updatePromise: Promise<T> | null = null;
  private stateObservable: Observable<T>;

  protected stateSubject: BehaviorSubject<T | typeof FAKE_DEFAULT> = new BehaviorSubject<
    T | typeof FAKE_DEFAULT
  >(FAKE_DEFAULT);

  get state$() {
    this.stateObservable = this.stateObservable ?? this.initializeObservable();
    return this.stateObservable;
  }

  constructor(
    private keyDefinition: KeyDefinition<T>,
    private chosenLocation: AbstractStorageService & ObservableStorageService,
  ) {
    this.storageKey = globalKeyBuilder(this.keyDefinition);
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {},
  ): Promise<T> {
    options = populateOptionsWithDefault(options);

    this.updatePromise = this.getGuaranteedState().then((currentState) =>
      this.internalUpdate(currentState, configureState, options),
    );
    const newState = await this.updatePromise;
    this.updatePromise = null;
    return newState;
  }

  private async internalUpdate<TCombine>(
    currentState: T,
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine>,
  ): Promise<T> {
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return currentState;
    }

    const newState = configureState(currentState, combinedDependencies);
    await this.chosenLocation.save(this.storageKey, newState);
    return newState;
  }

  private initializeObservable() {
    const storageUpdates$ = this.chosenLocation.updates$.pipe(
      filter((update) => update.key === this.storageKey),
      switchMap(async (update) => {
        if (update.updateType === "remove") {
          return null;
        }
        return await this.getFromState();
      }),
    );

    // TODO MDG: handle this subscription
    storageUpdates$.subscribe((value) => {
      this.stateSubject.next(value);
    });

    // Intentionally un-awaited promise, we don't want to delay return of observable, but we do want to
    // trigger populating it immediately.
    this.getFromState().then((s) => {
      this.stateSubject.next(s);
    });

    return new Observable<T>((subscriber) => {
      return this.stateSubject
        .pipe(
          // Filter out fake default, which is used to indicate that state is not ready to be emitted yet.
          filter<T>((i) => i != FAKE_DEFAULT),
          // We don't want to emit during an update, so they are filtered
          filter<T>(() => this.updatePromise == null),
        )
        .subscribe(subscriber);
    });
  }

  private async getGuaranteedState() {
    if (this.updatePromise != null) {
      return await this.updatePromise;
    }
    const currentValue = this.stateSubject.getValue();
    return currentValue === FAKE_DEFAULT ? await this.getFromState() : currentValue;
  }

  async getFromState(): Promise<T> {
    if (this.updatePromise != null) {
      return await this.updatePromise;
    }
    return await getStoredValue(
      this.storageKey,
      this.chosenLocation,
      this.keyDefinition.deserializer,
    );
  }
}
