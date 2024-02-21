import { firstValueFrom } from "rxjs";

import { UserId } from "../../types/guid";
import { StorageServiceProvider } from "../services/storage-service.provider";

import { GlobalState } from "./global-state";
import { GlobalStateProvider } from "./global-state.provider";
import { ClearEvent, KeyDefinition, userKeyBuilder } from "./key-definition";
import { StateDefinition, StorageLocation } from "./state-definition";
import {
  STATE_LOCK_EVENT,
  STATE_LOGOUT_EVENT,
  StateEventInfo,
} from "./state-event-registrar.service";

export class StateEventRunnerService {
  private readonly stateEventMap: { [Prop in ClearEvent]: GlobalState<StateEventInfo[]> };

  constructor(
    globalStateProvider: GlobalStateProvider,
    private storageServiceProvider: StorageServiceProvider,
  ) {
    this.stateEventMap = {
      lock: globalStateProvider.get(STATE_LOCK_EVENT),
      logout: globalStateProvider.get(STATE_LOGOUT_EVENT),
    };
  }

  async handleEvent(event: ClearEvent, userId: UserId) {
    let tickets = await firstValueFrom(this.stateEventMap[event].state$);
    tickets ??= [];

    for (const ticket of tickets) {
      const [, service] = this.storageServiceProvider.get(
        ticket.location as unknown as StorageLocation,
        {}, // The storage location is already the computed storage location for this client
      );

      const ticketStorageKey = userKeyBuilder(userId, {
        key: ticket.key,
        stateDefinition: { name: ticket.state } as unknown as StateDefinition,
      } as unknown as KeyDefinition<unknown>);

      // Evaluate current value so we can avoid writing to state if we don't need to
      const currentValue = await service.get(ticketStorageKey);
      if (currentValue != null) {
        await service.remove(ticketStorageKey);
      }
    }
  }
}
