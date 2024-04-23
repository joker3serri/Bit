import { combineLatestWith, map, distinctUntilChanged, shareReplay, combineLatest } from "rxjs";

import {
  AccountInfo,
  InternalAccountService,
  accountInfoEqual,
} from "../../auth/abstractions/account.service";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import {
  ACCOUNT_DISK,
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
} from "../../platform/state";
import { UserId } from "../../types/guid";
import { AccountActivityService } from "../abstractions/account-activity.service";

export const ACCOUNT_ACCOUNTS = KeyDefinition.record<AccountInfo, UserId>(
  ACCOUNT_DISK,
  "accounts",
  {
    deserializer: (accountInfo) => accountInfo,
  },
);

export const ACCOUNT_ACTIVE_ACCOUNT_ID = new KeyDefinition(ACCOUNT_DISK, "activeAccountId", {
  deserializer: (id: UserId) => id,
});

export const ACCOUNT_ACTIVITY = KeyDefinition.record<Date, UserId>(ACCOUNT_DISK, "activity", {
  deserializer: (activity) => new Date(activity),
});

const loggedOutInfo: AccountInfo = {
  email: "",
  emailVerified: false,
  name: undefined,
};

export class AccountServiceImplementation implements InternalAccountService {
  private accountsState: GlobalState<Record<UserId, AccountInfo>>;
  private activeAccountIdState: GlobalState<UserId | undefined>;

  accounts$;
  activeAccount$;
  nextUpActiveUsers$;

  constructor(
    private messagingService: MessagingService,
    private logService: LogService,
    private globalStateProvider: GlobalStateProvider,
    private accountActivityService: AccountActivityService,
  ) {
    this.accountsState = this.globalStateProvider.get(ACCOUNT_ACCOUNTS);
    this.activeAccountIdState = this.globalStateProvider.get(ACCOUNT_ACTIVE_ACCOUNT_ID);

    this.accounts$ = this.accountsState.state$.pipe(
      map((accounts) => (accounts == null ? {} : accounts)),
    );
    this.activeAccount$ = this.activeAccountIdState.state$.pipe(
      combineLatestWith(this.accounts$),
      map(([id, accounts]) => (id ? { id, ...accounts[id] } : undefined)),
      distinctUntilChanged((a, b) => a?.id === b?.id && accountInfoEqual(a, b)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.nextUpActiveUsers$ = combineLatest([
      this.accounts$,
      this.activeAccount$,
      this.accountActivityService.sortedUserIds$,
    ]).pipe(
      map(([accounts, activeAccount, sortedUserIds]) => {
        return sortedUserIds
          .filter((id) => id !== activeAccount?.id && accounts[id] != null)
          .map((id) => ({ id, ...accounts[id] }));
      }),
    );
  }

  async addAccount(userId: UserId, accountData: AccountInfo): Promise<void> {
    await this.accountsState.update((accounts) => {
      accounts ||= {};
      accounts[userId] = accountData;
      return accounts;
    });
    await this.accountActivityService.setAccountActivity(userId, new Date());
  }

  async setAccountName(userId: UserId, name: string): Promise<void> {
    await this.setAccountInfo(userId, { name });
  }

  async setAccountEmail(userId: UserId, email: string): Promise<void> {
    await this.setAccountInfo(userId, { email });
  }

  async setAccountEmailVerified(userId: UserId, emailVerified: boolean): Promise<void> {
    await this.setAccountInfo(userId, { emailVerified });
  }

  async clean(userId: UserId) {
    await this.setAccountInfo(userId, loggedOutInfo);
    await this.accountActivityService.removeAccountActivity(userId);
  }

  async switchAccount(userId: UserId): Promise<void> {
    await this.activeAccountIdState.update(
      (_, accounts) => {
        if (userId == null) {
          // indicates no account is active
          return null;
        }

        if (accounts?.[userId] == null) {
          throw new Error("Account does not exist");
        }
        return userId;
      },
      {
        combineLatestWith: this.accounts$,
        shouldUpdate: (id) => {
          // update only if userId changes
          return id !== userId;
        },
      },
    );
  }

  // TODO: update to use our own account status settings. Requires inverting direction of state service accounts flow
  async delete(): Promise<void> {
    try {
      this.messagingService?.send("logout");
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }

  private async setAccountInfo(userId: UserId, update: Partial<AccountInfo>): Promise<void> {
    function newAccountInfo(oldAccountInfo: AccountInfo): AccountInfo {
      return { ...oldAccountInfo, ...update };
    }
    await this.accountsState.update(
      (accounts) => {
        accounts[userId] = newAccountInfo(accounts[userId]);
        return accounts;
      },
      {
        // Avoid unnecessary updates
        // TODO: Faster comparison, maybe include a hash on the objects?
        shouldUpdate: (accounts) => {
          if (accounts?.[userId] == null) {
            throw new Error("Account does not exist");
          }

          return !accountInfoEqual(accounts[userId], newAccountInfo(accounts[userId]));
        },
      },
    );
  }
}
