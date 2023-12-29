import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subscription,
  filter,
  firstValueFrom,
  map,
} from "rxjs";

import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DeriveDefinition, DerivedState } from "@bitwarden/common/platform/state";
import { Type } from "@bitwarden/common/types/state";

import { fromChromeEvent } from "../browser/from-chrome-event";

export class ForegroundDerivedState<TTo> implements DerivedState<TTo> {
  private port: chrome.runtime.Port;
  private backgroundResponses$: Observable<DerivedStateMessage>;
  private backgroundSubscription: Subscription;
  private stateSubject = new ReplaySubject<TTo>(1);
  private subscriberCount = new BehaviorSubject<number>(0);
  private stateObservable: Observable<TTo>;
  private reinitialize = false;
  get state$() {
    this.stateObservable = this.stateObservable ?? this.initializeObservable();
    return this.stateObservable;
  }

  constructor(
    private deriveDefinition: DeriveDefinition<unknown, TTo, Record<string, Type<unknown>>>,
  ) {}

  async forceValue(value: TTo): Promise<TTo> {
    let cleanPort = false;
    if (this.port == null) {
      this.initializePort();
      cleanPort = true;
    }
    await this.delegateToBackground("nextState", value);
    if (cleanPort) {
      this.tearDownPort();
    }
    return value;
  }

  private initializeObservable(): Observable<TTo> {
    this.initializePort();

    this.backgroundSubscription = this.backgroundResponses$
      .pipe(
        filter((message) => message.action === "nextState"),
        map((message) => this.hydrateNext(message.data)),
      )
      .subscribe((v) => this.stateSubject.next(v));

    this.subscriberCount.subscribe((count) => {
      if (count === 0) {
        this.triggerCleanup();
      }
    });

    return new Observable<TTo>((subscriber) => {
      this.incrementSubscribers();

      if (this.reinitialize) {
        this.reinitialize = false;
        this.initializeObservable();
      }

      const prevUnsubscribe = subscriber.unsubscribe.bind(subscriber);
      subscriber.unsubscribe = () => {
        this.decrementSubscribers();
        prevUnsubscribe();
      };

      return this.stateSubject.subscribe(subscriber);
    });
  }

  private initializePort() {
    if (this.port != null) {
      return;
    }

    this.port = chrome.runtime.connect({ name: this.deriveDefinition.buildCacheKey() });

    this.backgroundResponses$ = fromChromeEvent(this.port.onMessage).pipe(
      map(([message]) => message as DerivedStateMessage),
      filter((message) => message.originator === "background"),
    );
  }

  private tearDownPort() {
    if (this.port == null) {
      return;
    }

    this.port.disconnect();
    this.port = null;
    this.backgroundResponses$ = null;
  }

  private async delegateToBackground(action: DerivedStateActions, data: TTo): Promise<void> {
    const id = Utils.newGuid();
    // listen for response before request
    const response = firstValueFrom(
      this.backgroundResponses$.pipe(filter((message) => message.id === id)),
    );

    this.sendMessage({
      id,
      action,
      data: JSON.stringify(data),
    });

    await response;
  }

  private sendMessage(message: Omit<DerivedStateMessage, "originator">) {
    this.port.postMessage({
      ...message,
      originator: "foreground",
    });
  }

  private hydrateNext(value: string): TTo {
    const jsonObj = JSON.parse(value);
    return this.deriveDefinition.deserialize(jsonObj);
  }

  private incrementSubscribers() {
    this.subscriberCount.next(this.subscriberCount.value + 1);
  }

  private decrementSubscribers() {
    this.subscriberCount.next(this.subscriberCount.value - 1);
  }

  private triggerCleanup() {
    setTimeout(() => {
      if (this.subscriberCount.value === 0) {
        this.tearDownPort();
        this.stateSubject.complete();
        this.stateSubject = new ReplaySubject<TTo>(1);
        this.backgroundSubscription.unsubscribe();
        this.subscriberCount.complete();
        this.subscriberCount = new BehaviorSubject<number>(0);
        this.reinitialize = true;
      }
    }, this.deriveDefinition.cleanupDelayMs);
  }
}
