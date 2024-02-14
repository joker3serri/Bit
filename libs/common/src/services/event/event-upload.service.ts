import { firstValueFrom, map } from "rxjs";

import { ApiService } from "../../abstractions/api.service";
import { EventUploadService as EventUploadServiceAbstraction } from "../../abstractions/event/event-upload.service";
import { AccountService } from "../../auth/abstractions/account.service";
import { AuthenticationStatus } from "../../auth/enums/authentication-status";
import { EventRequest } from "../../models/request/event.request";
import { LogService } from "../../platform/abstractions/log.service";
import { StateProvider } from "../../platform/state";
import { UserId } from "../../types/guid";

import { EVENT_COLLECTION } from "./key-definitions";

export class EventUploadService implements EventUploadServiceAbstraction {
  private inited = false;
  constructor(
    private apiService: ApiService,
    private stateProvider: StateProvider,
    private logService: LogService,
    private accountService: AccountService,
  ) {}

  init(checkOnInterval: boolean) {
    if (this.inited) {
      return;
    }

    this.inited = true;
    if (checkOnInterval) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.uploadEvents();
      setInterval(() => this.uploadEvents(), 60 * 1000); // check every 60 seconds
    }
  }

  /** Upload the event collection from state.
   *  @param userId upload events for provided user. If not active user will be used.
   */
  async uploadEvents(userId?: UserId): Promise<void> {
    if (!userId) {
      userId = await firstValueFrom(this.stateProvider.activeUserId$);
    }

    const userAuth$ = this.accountService.activeAccount$.pipe(
      map((acctData) => acctData != null && acctData.status == AuthenticationStatus.Unlocked),
    );

    const authed = await firstValueFrom(userAuth$);
    if (!authed) {
      return;
    }

    // Get the user's event collection from the state provider
    const eventStore = this.stateProvider.getUser(userId, EVENT_COLLECTION);
    const eventCollection = await firstValueFrom(eventStore.state$);

    if (eventCollection == null || eventCollection.length === 0) {
      return;
    }
    const request = eventCollection.map((e) => {
      const req = new EventRequest();
      req.type = e.type;
      req.cipherId = e.cipherId;
      req.date = e.date;
      req.organizationId = e.organizationId;
      return req;
    });
    try {
      await this.apiService.postEventsCollect(request);
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.takeEvents(userId);
    } catch (e) {
      this.logService.error(e);
    }
  }

  /** Reset the event collection for the user
   *  @param userId the user to have their event collection reset
   */
  private async takeEvents(userId: UserId): Promise<any> {
    let taken = null;
    await this.stateProvider.getUser(userId, EVENT_COLLECTION).update((current) => {
      taken = current ?? [];
      return [];
    });

    return taken;
  }
}
