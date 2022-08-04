import { BehaviorSubject, Subscription } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SyncedItemMetadata } from "./sync-item-metadata";

export class SessionSyncer {
  subscription: Subscription;
  id = Utils.newGuid();

  // everyone gets the same initial values
  private ignore_next_update = true;

  constructor(
    private behaviorSubject: BehaviorSubject<any>,
    private stateService: StateService,
    private metaData: SyncedItemMetadata
  ) {
    if (!(behaviorSubject instanceof BehaviorSubject)) {
      throw new Error("behaviorSubject must be an instance of BehaviorSubject");
    }

    if (metaData.ctor == null && metaData.initializer == null) {
      throw new Error("ctor or initializer must be provided");
    }
  }

  init() {
    if (chrome.runtime.getManifest().manifest_version != 3) {
      return;
    }

    this.observe();
    this.listenForUpdates();
  }

  observe() {
    // This may be a memory leak.
    // There is no good time to unsubscribe from this observable. Hopefully Manifest V3 clears memory from temporary
    // contexts. If so, this is handled by destruction of the context.
    this.subscription = this.behaviorSubject.subscribe(async (next) => {
      if (this.ignore_next_update) {
        this.ignore_next_update = false;
        return;
      }
      await this.updateSession(next);
    });
  }

  listenForUpdates() {
    // This is an unawaited promise, but it will be executed asynchronously in the background.
    BrowserApi.messageListener(
      this.updateMessageCommand,
      async (message) => await this.updateFromMessage(message)
    );
  }

  async updateFromMessage(message: any) {
    if (message.command != this.updateMessageCommand || message.id === this.id) {
      return;
    }
    const key_value_pair = await this.stateService.getFromSessionMemory(this.metaData.key);
    const value = SessionSyncer.buildFromKeyValuePair(key_value_pair, this.metaData);
    this.ignore_next_update = true;
    this.behaviorSubject.next(value);
  }

  async updateSession(value: any) {
    await this.stateService.setInSessionMemory(this.metaData.key, value);
    await BrowserApi.sendMessage(this.updateMessageCommand, { id: this.id });
  }

  static buildFromKeyValuePair(key_value_pair: any, metaData: SyncedItemMetadata) {
    const builder = SessionSyncer.getBuilder(metaData);

    if (metaData.initializeAsArray) {
      return key_value_pair.map((o: any) => builder(o));
    } else {
      return builder(key_value_pair);
    }
  }

  private static getBuilder(metaData: SyncedItemMetadata) {
    return metaData.initializer != null
      ? metaData.initializer
      : (o: any) => Object.create(metaData.ctor.prototype, Object.getOwnPropertyDescriptors(o));
  }

  private get updateMessageCommand() {
    return `${this.metaData.key}_update`;
  }
}
