import { EventType } from "../../enums/event-type";

export class EventData {
  type: EventType;
  cipherId: string;
  date: string;
  organizationId: string;
}
