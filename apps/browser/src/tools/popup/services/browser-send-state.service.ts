import { Observable, firstValueFrom } from "rxjs";
import { Jsonify } from "type-fest";

import {
  ActiveUserState,
  KeyDefinition,
  BROWSER_SEND_MEMORY,
  StateProvider,
} from "@bitwarden/common/platform/state";

import { BrowserComponentState } from "../../../models/browserComponentState";
import { BrowserSendComponentState } from "../../../models/browserSendComponentState";

export const BROWSER_SEND_COMPONENT = new KeyDefinition<BrowserSendComponentState>(
  BROWSER_SEND_MEMORY,
  "browser_send_component",
  {
    deserializer: (obj: Jsonify<BrowserSendComponentState>) =>
      BrowserSendComponentState.fromJSON(obj),
  },
);

export const BROWSER_SEND_TYPE_COMPONENT = new KeyDefinition<BrowserComponentState>(
  BROWSER_SEND_MEMORY,
  "browser_send_type_component",
  {
    deserializer: (obj: Jsonify<BrowserComponentState>) => BrowserComponentState.fromJSON(obj),
  },
);

export class BrowserSendStateService {
  browserSendComponentState$: Observable<BrowserSendComponentState>;
  browserSendTypeComponentState$: Observable<BrowserComponentState>;

  private activeUserBrowserSendComponentState: ActiveUserState<BrowserSendComponentState>;
  private activeUserBrowserSendTypeComponentState: ActiveUserState<BrowserComponentState>;

  constructor(protected stateProvider: StateProvider) {
    this.activeUserBrowserSendComponentState = this.stateProvider.getActive(BROWSER_SEND_COMPONENT);
    this.browserSendComponentState$ = this.activeUserBrowserSendComponentState.state$;

    this.activeUserBrowserSendTypeComponentState = this.stateProvider.getActive(
      BROWSER_SEND_TYPE_COMPONENT,
    );
    this.browserSendTypeComponentState$ = this.activeUserBrowserSendTypeComponentState.state$;
  }

  async getBrowserSendComponentState(): Promise<BrowserSendComponentState> {
    return await firstValueFrom(this.browserSendComponentState$);
  }

  async setBrowserSendComponentState(value: BrowserSendComponentState): Promise<void> {
    await this.activeUserBrowserSendComponentState.update(() => value);
  }

  async getBrowserSendTypeComponentState(): Promise<BrowserComponentState> {
    return await firstValueFrom(this.browserSendTypeComponentState$);
  }

  async setBrowserSendTypeComponentState(value: BrowserComponentState): Promise<void> {
    await this.activeUserBrowserSendTypeComponentState.update(() => value);
  }
}
