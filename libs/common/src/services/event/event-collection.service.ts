import { firstValueFrom, map, from, zip } from "rxjs";

import { EventCollectionService as EventCollectionServiceAbstraction } from "../../abstractions/event/event-collection.service";
import { EventUploadService } from "../../abstractions/event/event-upload.service";
import { OrganizationService } from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { AccountService } from "../../auth/abstractions/account.service";
import { AuthenticationStatus } from "../../auth/enums/authentication-status";
import { EventType } from "../../enums";
import { EventData } from "../../models/data/event.data";
import { StateProvider } from "../../platform/state";
import { CipherService } from "../../vault/abstractions/cipher.service";

import { EVENT_COLLECTION } from "./key-definitions";

export class EventCollectionService implements EventCollectionServiceAbstraction {
  constructor(
    private cipherService: CipherService,
    private stateProvider: StateProvider,
    private organizationService: OrganizationService,
    private eventUploadService: EventUploadService,
    private accountService: AccountService,
  ) {}

  async collect(
    eventType: EventType,
    cipherId: string = null,
    uploadImmediately = false,
    organizationId: string = null,
  ): Promise<any> {
    const userId = await firstValueFrom(this.stateProvider.activeUserId$);
    const userAuth$ = this.accountService.activeAccount$.pipe(
      map((acctData) => acctData != null && acctData.status == AuthenticationStatus.Unlocked),
    );

    const orgIds$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs?.filter((o) => o.useEvents)?.map((x) => x.id) ?? []),
    );

    // Determine if the collection should update
    const shouldUpdate$ = zip(userAuth$, orgIds$, from(this.cipherService.get(cipherId))).pipe(
      map(([userAuth, orgs, cipher]) => {
        // The user must be authorized
        if (!userAuth) {
          return false;
        }

        // User must have organizations assigned to them
        if (orgs == null || orgs.length == 0) {
          return false;
        }

        // If the cipher is null there must be an organization id provided
        if (cipher == null && organizationId == null) {
          return false;
        }

        // If the cipher is present it must be in the user's org list
        if (cipher != null && !orgs.includes(cipher?.organizationId)) {
          return false;
        }

        // If the organization id is provided it must be in the user's org list
        if (organizationId != null && !orgs.includes(organizationId)) {
          return false;
        }

        return true;
      }),
    );

    const eventStore = this.stateProvider.getUser(userId, EVENT_COLLECTION);

    const event = new EventData();
    event.type = eventType;
    event.cipherId = cipherId;
    event.date = new Date().toISOString();
    event.organizationId = organizationId;

    await eventStore.update(
      (events) => {
        events = events ?? [];
        events.push(event);
        return events;
      },
      {
        combineLatestWith: shouldUpdate$,
        shouldUpdate: (_, shouldUpdate) => shouldUpdate,
      },
    );

    if (uploadImmediately) {
      await this.eventUploadService.uploadEvents();
    }
  }
}
