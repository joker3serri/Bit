import { firstValueFrom, map, from, zip, Observable } from "rxjs";

import { EventCollectionService as EventCollectionServiceAbstraction } from "../../abstractions/event/event-collection.service";
import { EventUploadService } from "../../abstractions/event/event-upload.service";
import { OrganizationService } from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { AuthService } from "../../auth/abstractions/auth.service";
import { AuthenticationStatus } from "../../auth/enums/authentication-status";
import { EventType } from "../../enums";
import { EventData } from "../../models/data/event.data";
import { StateProvider } from "../../platform/state";
import { CipherService } from "../../vault/abstractions/cipher.service";
import { CipherView } from "../../vault/models/view/cipher.view";

import { EVENT_COLLECTION } from "./key-definitions";

export class EventCollectionService implements EventCollectionServiceAbstraction {
  private orgIds$: Observable<string[]>;

  constructor(
    private cipherService: CipherService,
    private stateProvider: StateProvider,
    private organizationService: OrganizationService,
    private eventUploadService: EventUploadService,
    private authService: AuthService,
  ) {
    this.orgIds$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs?.filter((o) => o.useEvents)?.map((x) => x.id) ?? []),
    );
  }

  /** Adds an event to the active user's event collection
   *  @param eventType the event type to be added
   *  @param ciphers The collection of ciphers to log events for
   *  @param uploadImmediately in some cases the recorded events should be uploaded right after being added
   */
  async collectMany(
    eventType: EventType,
    ciphers: CipherView[],
    uploadImmediately = false,
  ): Promise<any> {
    const userId = await firstValueFrom(this.stateProvider.activeUserId$);
    const eventStore = this.stateProvider.getUser(userId, EVENT_COLLECTION);

    if (!(await this.shouldUpdate(null, eventType, ciphers))) {
      return;
    }

    const events$ = this.orgIds$.pipe(
      map((orgs) => {
        const filtered = ciphers.filter((c) => orgs.includes(c.organizationId));
        return filtered.map((c) => {
          const event = new EventData();
          event.type = eventType;
          event.cipherId = c.id;
          event.date = new Date().toISOString();
          event.organizationId = c.organizationId;
          return event;
        });
      }),
    );

    await eventStore.update(
      (currentEvents, newEvents) => {
        const events = currentEvents ?? [];
        events.push(...newEvents);
        return events;
      },
      {
        combineLatestWith: events$,
      },
    );

    if (uploadImmediately) {
      await this.eventUploadService.uploadEvents();
    }
  }

  /** Adds an event to the active user's event collection
   *  @param eventType the event type to be added
   *  @param cipherId if provided the id of the cipher involved in the event
   *  @param uploadImmediately in some cases the recorded events should be uploaded right after being added
   *  @param organizationId the organizationId involved in the event. If the cipherId is not provided an organizationId is required
   */
  async collect(
    eventType: EventType,
    cipherId: string = null,
    uploadImmediately = false,
    organizationId: string = null,
  ): Promise<any> {
    const userId = await firstValueFrom(this.stateProvider.activeUserId$);
    const eventStore = this.stateProvider.getUser(userId, EVENT_COLLECTION);

    if (!(await this.shouldUpdate(organizationId, eventType, undefined, cipherId))) {
      return;
    }

    const event = new EventData();
    event.type = eventType;
    event.cipherId = cipherId;
    event.date = new Date().toISOString();
    event.organizationId = organizationId;

    await eventStore.update((events) => {
      events = events ?? [];
      events.push(event);
      return events;
    });

    if (uploadImmediately) {
      await this.eventUploadService.uploadEvents();
    }
  }

  /** Verifies if the event collection should be updated for the provided information
   *  @param cipherId the cipher for the event
   *  @param organizationId the organization for the event
   */
  private async shouldUpdate(
    organizationId: string = null,
    eventType: EventType = null,
    ciphers: CipherView[] = [],
    cipherId?: string,
  ): Promise<boolean> {
    const cipher$ = from(this.cipherService.get(cipherId));

    const [authStatus, orgIds, cipher] = await firstValueFrom(
      zip(this.authService.activeAccountStatus$, this.orgIds$, cipher$),
    );

    // The user must be authorized
    if (authStatus != AuthenticationStatus.Unlocked) {
      return false;
    }

    // User must have organizations assigned to them
    if (orgIds == null || orgIds.length == 0) {
      return false;
    }

    // Individual vault export doesn't need cipher id or organization id.
    if (eventType == EventType.User_ClientExportedVault) {
      return true;
    }

    // If the cipherId was provided and a cipher exists, add it to the collection
    if (cipher != null) {
      ciphers.push(new CipherView(cipher));
    }

    // If no ciphers there must be an organization id provided
    if ((ciphers == null || ciphers.length == 0) && organizationId == null) {
      return false;
    }

    // If the input list of ciphers is provided. Check the ciphers to see if any
    // are in the user's org list
    if (ciphers != null && ciphers.length > 0) {
      const filtered = ciphers.filter((c) => orgIds.includes(c.organizationId));
      return filtered.length > 0;
    }

    // If the organization id is provided it must be in the user's org list
    if (organizationId != null && !orgIds.includes(organizationId)) {
      return false;
    }

    return true;
  }
}
