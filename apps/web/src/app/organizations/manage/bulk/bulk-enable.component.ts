import { Component, Input } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationUserBulkRequest } from "jslib-common/models/request/organizationUserBulkRequest";

import { BulkUserDetails } from "./bulk-status.component";

@Component({
  selector: "app-bulk-enable",
  templateUrl: "bulk-enable.component.html",
})
export class BulkEnableComponent {
  @Input() organizationId: string;
  @Input() users: BulkUserDetails[];

  statuses: Map<string, string> = new Map();

  loading = false;
  done = false;
  error: string;

  constructor(protected apiService: ApiService, protected i18nService: I18nService) {}

  async submit() {
    this.loading = true;
    try {
      const response = await this.enableUsers();

      response.data.forEach((entry) => {
        const error = entry.error !== "" ? entry.error : this.i18nService.t("bulkEnabledMessage");
        this.statuses.set(entry.id, error);
      });
      this.done = true;
    } catch (e) {
      this.error = e.message;
    }

    this.loading = false;
  }

  protected async enableUsers() {
    const request = new OrganizationUserBulkRequest(this.users.map((user) => user.id));
    return await this.apiService.enableManyOrganizationUsers(this.organizationId, request);
  }
}
