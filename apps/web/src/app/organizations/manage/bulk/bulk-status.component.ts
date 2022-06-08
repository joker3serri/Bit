import { Component } from "@angular/core";

import { OrganizationUserStatusType } from "@bitwarden/common/src/enums/organizationUserStatusType";
import { ProviderUserStatusType } from "@bitwarden/common/src/enums/providerUserStatusType";

export interface BulkUserDetails {
  id: string;
  name: string;
  email: string;
  status: OrganizationUserStatusType | ProviderUserStatusType;
}

type BulkStatusEntry = {
  user: BulkUserDetails;
  error: boolean;
  message: string;
};

@Component({
  selector: "app-bulk-status",
  templateUrl: "bulk-status.component.html",
})
export class BulkStatusComponent {
  users: BulkStatusEntry[];
  loading = false;
}
