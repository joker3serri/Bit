import { Observable, filter, firstValueFrom, tap } from "rxjs";

import { AppIdService as AppIdServiceAbstraction } from "../abstractions/app-id.service";
import { Utils } from "../misc/utils";
import { APPLICATION_ID_DISK, GlobalStateProvider, KeyDefinition } from "../state";

export const APP_ID_KEY = new KeyDefinition(APPLICATION_ID_DISK, "appId", {
  deserializer: (value: string) => value,
});
export const ANONYMOUS_APP_ID_KEY = new KeyDefinition(APPLICATION_ID_DISK, "anonymousAppId", {
  deserializer: (value: string) => value,
});

export class AppIdService implements AppIdServiceAbstraction {
  appId$: Observable<string>;
  anonymousAppId$: Observable<string>;

  private updatingAppId = false;
  private updatingAnonymousAppId = false;

  constructor(globalStateProvider: GlobalStateProvider) {
    const appIdState = globalStateProvider.get(APP_ID_KEY);
    const anonymousAppIdState = globalStateProvider.get(ANONYMOUS_APP_ID_KEY);
    this.appId$ = appIdState.state$.pipe(
      tap(async (appId) => {
        if (!appId && !this.updatingAppId) {
          try {
            this.updatingAppId = true;
            await appIdState.update(() => Utils.newGuid(), {
              shouldUpdate: (v) => {
                return v == null;
              },
            });
          } finally {
            this.updatingAppId = false;
          }
        }
      }),
      filter((appId) => !!appId),
    );
    this.anonymousAppId$ = anonymousAppIdState.state$.pipe(
      tap(async (appId) => {
        if (!appId && !this.updatingAnonymousAppId) {
          try {
            this.updatingAnonymousAppId = true;
            await anonymousAppIdState.update(() => Utils.newGuid(), {
              shouldUpdate: (v) => v == null,
            });
          } finally {
            this.updatingAnonymousAppId = false;
          }
        }
      }),
      filter((appId) => !!appId),
    );
  }

  async getAppId(): Promise<string> {
    return await firstValueFrom(this.appId$);
  }

  async getAnonymousAppId(): Promise<string> {
    return await firstValueFrom(this.anonymousAppId$);
  }
}
