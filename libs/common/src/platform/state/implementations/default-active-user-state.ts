import {
  Observable,
  map,
  switchMap,
  firstValueFrom,
  timeout,
  throwError,
  NEVER,
  tap,
  filter,
} from "rxjs";

import { UserId } from "../../../types/guid";
import { StateUpdateOptions, populateOptionsWithDefault } from "../state-update-options";
import { UserKeyDefinition } from "../user-key-definition";
import { ActiveUserState, CombinedState, activeMarker } from "../user-state";
import { SingleUserStateProvider } from "../user-state.provider";

export class DefaultActiveUserState<T> implements ActiveUserState<T> {
  [activeMarker]: true;
  private updatePromise: Promise<[UserId, T]> | null = null;

  combinedState$: Observable<CombinedState<T>>;
  state$: Observable<T>;

  constructor(
    protected keyDefinition: UserKeyDefinition<T>,
    private activeUserId$: Observable<UserId | null>,
    private singleUserStateProvider: SingleUserStateProvider,
  ) {
    this.combinedState$ = this.activeUserId$.pipe(
      tap(() => (this.updatePromise = null)),
      switchMap((userId) =>
        userId != null
          ? this.singleUserStateProvider.get(userId, this.keyDefinition).combinedState$
          : NEVER,
      ),
    );

    // State should just be combined state without the user id
    this.state$ = this.combinedState$.pipe(map(([_userId, state]) => state));
  }

  async update<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine> = {},
  ): Promise<[UserId, T]> {
    options = populateOptionsWithDefault(options);
    try {
      if (this.updatePromise != null) {
        await this.updatePromise;
      }
      this.updatePromise = this.internalUpdate(configureState, options);
      const [userId, newState] = await this.updatePromise;
      return [userId, newState];
    } finally {
      this.updatePromise = null;
    }
  }

  private async internalUpdate<TCombine>(
    configureState: (state: T, dependency: TCombine) => T,
    options: StateUpdateOptions<T, TCombine>,
  ): Promise<[UserId, T]> {
    const userId = await firstValueFrom(
      this.activeUserId$.pipe(
        filter((userId) => userId != null),
        timeout({
          first: 1000,
          with: () => throwError(() => new Error("No active user at this time.")),
        }),
      ),
    );

    const singleUserState = this.singleUserStateProvider.get(userId, this.keyDefinition);

    // Delegate the update call to the single user state so we can only implement it once
    return [userId, await singleUserState.update(configureState, options)];
  }
}
