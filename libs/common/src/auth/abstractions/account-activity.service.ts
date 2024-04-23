import { Observable } from "rxjs";

import { UserId } from "../../types/guid";

export abstract class AccountActivityService {
  /**
   * Observable of the last activity time for each account.
   */
  accountActivity$: Observable<Record<UserId, Date>>;
  /**
   * Observable of the next-most-recent active account.
   */
  sortedUserIds$: Observable<UserId[]>;

  /**
   * Updates the given user's last activity time.
   * @param userId
   * @param lastActivity
   */
  abstract setAccountActivity(userId: UserId, lastActivity: Date): Promise<void>;
  /**
   * Removes a user from the account activity list.
   * @param userId
   */
  abstract removeAccountActivity(userId: UserId): Promise<void>;

  /**
   * Returns the most recent account that is not the current active account, as expressed by the `currentUser` observable.
   * @param currentUser Observable of the current active account's UserId.
   */
  abstract nextUpActiveAccount(currentUser: Observable<UserId>): Observable<UserId | null>;
}
