import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";

@Injectable({
  providedIn: "root",
})
export class SMExportService {
  constructor(private apiService: ApiService) {}

  async getExport(organizationId: string, exportFormat = "json"): Promise<any> {
    const r = await this.apiService.send(
      "GET",
      "/sm/" + organizationId + "/export",
      null,
      true,
      true
    );

    return r.data;
  }
}
