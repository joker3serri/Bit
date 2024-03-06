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
  private appIdState = this.globalStateProvider.get(APP_ID_KEY);
  private anonymousAppIdState = this.globalStateProvider.get(ANONYMOUS_APP_ID_KEY);
  constructor(private globalStateProvider: GlobalStateProvider) {}

  async getAppId(): Promise<string> {
    return await this.appIdState.update(() => Utils.newGuid(), {
      shouldUpdate: (value) => value == null,
    });
  }

  async getAnonymousAppId(): Promise<string> {
    return await this.anonymousAppIdState.update(() => Utils.newGuid(), {
      shouldUpdate: (value) => value == null,
    });
  }
}
