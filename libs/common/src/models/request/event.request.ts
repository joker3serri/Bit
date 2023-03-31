import { EventType } from "../../enums/event-type";

export class EventRequest {
  type: EventType;
  cipherId: string;
  date: string;
  organizationId: string;
}
