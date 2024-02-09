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
    const organizations = await firstValueFrom(this.organizationService.organizations$);
    const userAuth$ = this.accountService.activeAccount$.pipe(
      map((acctData) => {
        if (acctData != null && acctData.status == AuthenticationStatus.Unlocked) {
          return true;
        }
      }),
    );

    if (organizations == null || organizations.length == 0) {
      return;
    }

    const orgIds$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs?.filter((o) => o.useEvents)?.map((x) => x.id) ?? []),
    );

    // Update if:
    // - User is authorized
    // - If the cipher is null there must be an organization id provided.
    //   Or if the cipher is present it must be in the user's org list.
    // - If the organization id is provided it must be in the user's org list.
    const shouldUpdate$ = zip(userAuth$, orgIds$, from(this.cipherService.get(cipherId))).pipe(
      map(
        ([userAuth, orgs, cipher]) =>
          userAuth &&
          ((cipher == null && organizationId != null) || orgs.includes(cipher?.organizationId)) &&
          (organizationId == null || orgs.includes(organizationId)),
      ),
    );

    const eventStore = this.stateProvider.getUser(userId, EVENT_COLLECTION);

    const event = new EventData();
    event.type = eventType;
    event.cipherId = cipherId;
    event.date = new Date().toISOString();
    event.organizationId = organizationId;

    await eventStore.update(
      (events) => {
        events = events == null ? [] : events;
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
