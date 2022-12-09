import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { OrganizationUserInviteRequest } from "@bitwarden/common/models/request/organization-user-invite.request";
import { OrganizationUserUpdateRequest } from "@bitwarden/common/models/request/organization-user-update.request";
import { OrganizationUserDetailsResponse } from "@bitwarden/common/models/response/organization-user.response";

import { CoreOrganizationModule } from "../core-organization.module";
import { OrganizationUserAdminView } from "../views/user-admin-view";

@Injectable({ providedIn: CoreOrganizationModule })
export class UserAdminService {
  constructor(private apiService: ApiService, private cryptoService: CryptoService) {}

  async get(
    organizationId: string,
    organizationUserId: string
  ): Promise<OrganizationUserAdminView | undefined> {
    const userResponse = await this.apiService.getOrganizationUser(
      organizationId,
      organizationUserId
    );

    if (userResponse == null) {
      return undefined;
    }

    const [view] = await this.decryptMany(organizationId, [userResponse]);

    return view;
  }

  async save(user: OrganizationUserAdminView): Promise<void> {
    const request = new OrganizationUserUpdateRequest();
    request.accessAll = user.accessAll;
    request.permissions = user.permissions;
    request.type = user.type;
    request.collections = user.collections;

    await this.apiService.putOrganizationUser(user.organizationId, user.id, request);
  }

  async invite(emails: string[], user: OrganizationUserAdminView): Promise<void> {
    const request = new OrganizationUserInviteRequest();
    request.emails = emails;
    request.accessAll = user.accessAll;
    request.permissions = user.permissions;
    request.type = user.type;
    request.collections = user.collections;

    await this.apiService.postOrganizationUserInvite(user.organizationId, request);
  }

  private async decryptMany(
    organizationId: string,
    users: OrganizationUserDetailsResponse[]
  ): Promise<OrganizationUserAdminView[]> {
    const promises = users.map(async (u) => {
      const view = new OrganizationUserAdminView();

      view.id = u.id;
      view.organizationId = organizationId;
      view.userId = u.userId;
      view.type = u.type;
      view.status = u.status;
      view.accessAll = u.accessAll;
      view.permissions = u.permissions;
      view.resetPasswordEnrolled = u.resetPasswordEnrolled;
      view.collections = u.collections.map((c) => ({
        id: c.id,
        hidePasswords: c.hidePasswords,
        readOnly: c.readOnly,
      }));

      return view;
    });

    return await Promise.all(promises);
  }
}
