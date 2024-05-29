import { firstValueFrom } from "rxjs";

import { OrganizationAuthRequestService } from "@bitwarden/bit-common/admin-console/auth-requests";
import { Response } from "@bitwarden/cli/models/response";
import { OrganizationService } from "@bitwarden/common/admin-console/services/organization/organization.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

export class ApproveAllCommand {
  constructor(
    private organizationAuthRequestService: OrganizationAuthRequestService,
    private organizationService: OrganizationService,
  ) {}

  async run(organizationId: string): Promise<Response> {
    if (organizationId != null) {
      organizationId = organizationId.toLowerCase();
    }

    if (!Utils.isGuid(organizationId)) {
      return Response.badRequest("`" + organizationId + "` is not a GUID.");
    }

    const organization = await firstValueFrom(this.organizationService.get$(organizationId));
    if (!organization?.canManageUsersPassword) {
      return Response.error(
        "Unauthorized Access: you do not have permission to approve pending authorization requests.",
      );
    }

    try {
      const pendingApprovals =
        await this.organizationAuthRequestService.listPendingRequests(organizationId);
      if (pendingApprovals.length == 0) {
        throw new Error("No pending authorization requests to approve.");
      }

      await this.organizationAuthRequestService.approvePendingRequests(
        organizationId,
        pendingApprovals,
      );

      return Response.success();
    } catch (e) {
      return Response.error(e);
    }
  }
}
