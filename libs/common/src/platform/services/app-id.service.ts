import { Observable, distinctUntilChanged, firstValueFrom, switchMap } from "rxjs";

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
      switchMap(async (appId) => {
        if (!appId) {
          return await appIdState.update(() => Utils.newGuid(), {
            shouldUpdate: (v) => v == null,
          });
        }
        return appId;
      }),
      distinctUntilChanged(),
    );
    this.anonymousAppId$ = anonymousAppIdState.state$.pipe(
      switchMap(async (appId) => {
        if (!appId) {
          return await anonymousAppIdState.update(() => Utils.newGuid(), {
            shouldUpdate: (v) => v == null,
          });
        }
        return appId;
      }),
      distinctUntilChanged(),
    );
  }

  async getAppId(): Promise<string> {
    return await firstValueFrom(this.appId$);
  }

  async getAnonymousAppId(): Promise<string> {
    return await firstValueFrom(this.anonymousAppId$);
  }
}
