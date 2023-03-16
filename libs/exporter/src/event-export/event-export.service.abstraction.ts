import { EventView } from "@bitwarden/common/models/view/event.view";

export abstract class EventExportServiceAbstraction {
  getEventExport: (events: EventView[]) => Promise<string>;
  getFileName: (prefix?: string, extension?: string) => string;
}
