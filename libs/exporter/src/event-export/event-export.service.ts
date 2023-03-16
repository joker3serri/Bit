import * as papa from "papaparse";

import { EventView } from "@bitwarden/common/models/view/event.view";

import { ExportHelper } from "../export-helper";

import { EventExportServiceAbstraction } from "./event-export.service.abstraction";
import { EventExport } from "./event.export";

export class EventExportService implements EventExportServiceAbstraction {
  async getEventExport(events: EventView[]): Promise<string> {
    return papa.unparse(events.map((e) => new EventExport(e)));
  }

  getFileName(prefix: string = null, extension = "csv"): string {
    return ExportHelper.getFileName(prefix, extension);
  }
}
