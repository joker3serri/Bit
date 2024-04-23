import { Observable, combineLatest, map } from "rxjs";

import { ACCOUNT_DISK, GlobalStateProvider, KeyDefinition } from "../../platform/state";
import { UserId } from "../../types/guid";
import { AccountActivityService } from "../abstractions/account-activity.service";

export const ACCOUNT_ACTIVITY = KeyDefinition.record<Date, UserId>(ACCOUNT_DISK, "activity", {
  deserializer: (activity) => new Date(activity),
});

export class DefaultAccountActivityService implements AccountActivityService {
  accountActivity$: Observable<Record<UserId, Date>>;
  sortedUserIds$: Observable<UserId[]>;

  constructor(private globalStateProvider: GlobalStateProvider) {
    this.accountActivity$ = this.globalStateProvider
      .get(ACCOUNT_ACTIVITY)
      .state$.pipe(map((activity) => activity ?? {}));
    this.sortedUserIds$ = this.accountActivity$.pipe(
      map((activity) => {
        return Object.entries(activity)
          .map(([userId, lastActive]: [UserId, Date]) => ({ userId, lastActive }))
          .sort((a, b) => a.lastActive.getTime() - b.lastActive.getTime())
          .map((a) => a.userId);
      }),
    );
  }

  nextUpActiveAccount(currentUser: Observable<UserId>): Observable<UserId | null> {
    return combineLatest([this.sortedUserIds$, currentUser]).pipe(
      map(([sortedUserIds, currentUserId]) => {
        const filtered = sortedUserIds.filter((userId) => userId !== currentUserId);
        if (filtered.length > 0) {
          return filtered[0];
        }
        return null;
      }),
    );
  }

  async setAccountActivity(userId: UserId, lastActivity: Date): Promise<void> {
    await this.globalStateProvider.get(ACCOUNT_ACTIVITY).update(
      (activity) => {
        activity ||= {};
        activity[userId] = lastActivity;
        return activity;
      },
      {
        shouldUpdate: (oldActivity) => oldActivity?.[userId]?.getTime() !== lastActivity?.getTime(),
      },
    );
  }

  async removeAccountActivity(userId: UserId): Promise<void> {
    await this.globalStateProvider.get(ACCOUNT_ACTIVITY).update(
      (activity) => {
        if (activity == null) {
          return activity;
        }
        delete activity[userId];
        return activity;
      },
      { shouldUpdate: (oldActivity) => oldActivity?.[userId] != null },
    );
  }
}
