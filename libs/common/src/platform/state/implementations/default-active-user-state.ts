import {
  Observable,
  map,
  switchMap,
  firstValueFrom,
  filter,
  timeout,
  merge,
  share,
  ReplaySubject,
  timer,
  tap,
  throwError,
  distinctUntilChanged,
  withLatestFrom,
} from "rxjs";

import { AccountService } from "../../../auth/abstractions/account.service";
import { UserId } from "../../../types/guid";
import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition, userKeyBuilder } from "../key-definition";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";
import { ActiveUserState, CombinedState, activeMarker } from "../user-state";

import { getStoredValue } from "./util";

const FAKE = Symbol("fake");

export class DefaultActiveUserState<T> implements ActiveUserState<T> {
  [activeMarker]: true;
  private updatePromise: Promise<T> | null = null;

  private activeUserId$: Observable<UserId | null>;

  // Only here for testing
  private replaySubject: ReplaySubject<typeof FAKE | CombinedState<T>>;

  combinedState$: Observable<CombinedState<T>>;
  state$: Observable<T>;

  constructor(
    protected keyDefinition: KeyDefinition<T>,
    private accountService: AccountService,
    private chosenStorageLocation: AbstractStorageService & ObservableStorageService,
  ) {
    this.activeUserId$ = this.accountService.activeAccount$.pipe(
      // We only care about the UserId but we do want to know about no user as well.
      map((a) => a?.id),
      // To avoid going to storage when we don't need to, only get updates when there is a true change.
      distinctUntilChanged(),
    );

    const userChangeAndInitial$ = this.activeUserId$.pipe(
      // If the user has changed, we no longer need to lock an update call
      // since that call will be for a user that is no longer active.
      tap(() => (this.updatePromise = null)),
      switchMap(async (userId) => {
        // We've switched or started off with no active user. So,
        // emit a fake value so that we can fill our share buffer.
        if (userId == null) {
          return FAKE;
        }

        const fullKey = userKeyBuilder(userId, this.keyDefinition);
        const data = await getStoredValue(
          fullKey,
          this.chosenStorageLocation,
          this.keyDefinition.deserializer,
        );
        return [userId, data] as CombinedState<T>;
      }),
    );

    const latestStorage$ = this.chosenStorageLocation.updates$.pipe(
      // Use withLatestFrom so that we do NOT emit when activeUserId changes because that
      // is taken care of above, but we do want to have the latest user id
      // when we get a storage update so we can filter the full key
      withLatestFrom(this.activeUserId$),
      switchMap(async ([storageUpdate, userId]) => {
        if (userId == null) {
          // Technically we could return undefined here and everything should work
          // because the above observable should already be producing FAKE
          // when there is no active user so this will likely just overwrite that.
          // So as long as we return a value that doesn't make it's way to the consumer
          // (undefined or FAKE), we are good.
          return FAKE;
        }

        const fullKey = userKeyBuilder(userId, this.keyDefinition);
        if (storageUpdate.key !== fullKey) {
          // This is an update that is not applicable to us,
          // return undefined and filter out undefined below
          // don't return FAKE here because we don't want this
          // scenario to fill up the replay subjects buffer
          return undefined;
        }

        // We can shortcut on updateType of "remove"
        // and just emit null. Currently, "remove" is rarely,
        // if ever, called.
        if (storageUpdate.updateType === "remove") {
          return [userId, null] as CombinedState<T>;
        }

        return [
          userId,
          await getStoredValue(
            fullKey,
            this.chosenStorageLocation,
            this.keyDefinition.deserializer,
          ),
        ] as CombinedState<T>;
      }),
      // Filter out our special-ish value that denotes this method
      // ran and produced a value that is not actually applicable to us
      // at all.
      filter((d) => d !== undefined),
    );

    this.combinedState$ = merge(userChangeAndInitial$, latestStorage$).pipe(
      share({
        connector: () => {
          const newSubject = new ReplaySubject<CombinedState<T> | typeof FAKE>(1);
          // Save the reference to the subject for testing
          this.replaySubject = newSubject;
          return newSubject;
        },
        resetOnRefCountZero: () => timer(this.keyDefinition.cleanupDelayMs),
      }),
      // Filter out FAKE AFTER the share so that we can fill the ReplaySubjects
      // buffer with something and avoid emitting when there is no active user.
      filter<CombinedState<T>>((d) => d !== (FAKE as unknown)),
    );

    // State should just be combined state without the user id
    this.state$ = this.combinedState$.pipe(map(([_userId, state]) => state));
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {},
  ): Promise<T> {
    options = populateOptionsWithDefault(options);
    try {
      if (this.updatePromise != null) {
        await this.updatePromise;
      }
      this.updatePromise = this.internalUpdate(configureState, options);
      const newState = await this.updatePromise;
      return newState;
    } finally {
      this.updatePromise = null;
    }
  }

  private async internalUpdate<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine>,
  ) {
    const [key, currentState] = await this.getStateForUpdate();
    const combinedDependencies =
      options.combineLatestWith != null
        ? await firstValueFrom(options.combineLatestWith.pipe(timeout(options.msTimeout)))
        : null;

    if (!options.shouldUpdate(currentState, combinedDependencies)) {
      return currentState;
    }

    const newState = configureState(currentState, combinedDependencies);
    await this.saveToStorage(key, newState);
    return newState;
  }

  /** For use in update methods, does not wait for update to complete before yielding state.
   * The expectation is that that await is already done
   */
  protected async getStateForUpdate() {
    const [userId, data] = await firstValueFrom(
      this.combinedState$.pipe(
        timeout({
          first: 1000,
          with: () => throwError(() => new Error("No active user at this time.")),
        }),
      ),
    );
    return [userKeyBuilder(userId, this.keyDefinition), data] as const;
  }

  protected saveToStorage(key: string, data: T): Promise<void> {
    return this.chosenStorageLocation.save(key, data);
  }
}
