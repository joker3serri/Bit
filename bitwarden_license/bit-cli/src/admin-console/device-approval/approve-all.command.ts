import { firstValueFrom } from "rxjs";

import { OrganizationAuthRequestService } from "@bitwarden/bit-common/admin-console/auth-requests";
import { Response } from "@bitwarden/cli/models/response";
import { MessageResponse } from "@bitwarden/cli/models/response/message.response";
import { OrganizationService } from "@bitwarden/common/admin-console/services/organization/organization.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

export class ApproveAllCommand {
  constructor(
    private organizationAuthRequestService: OrganizationAuthRequestService,
    private organizationService: OrganizationService,
    private i18nService: I18nService,
  ) {}

  async run(organizationId: string): Promise<Response> {
    if (organizationId != null) {
      organizationId = organizationId.toLowerCase();
    }

    if (!Utils.isGuid(organizationId)) {
      return Response.badRequest(this.i18nService.t("notAGuid", organizationId));
    }

    const organization = await firstValueFrom(this.organizationService.get$(organizationId));
    if (!organization?.canManageUsersPassword) {
      return Response.error(this.i18nService.t("approveAllDevicesNoPermission"));
    }

    try {
      const pendingApprovals =
        await this.organizationAuthRequestService.listPendingRequests(organizationId);
      if (pendingApprovals.length == 0) {
        const res = new MessageResponse(this.i18nService.t("approveAllNoPendingApprovals"), null);
        return Response.success(res);
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
