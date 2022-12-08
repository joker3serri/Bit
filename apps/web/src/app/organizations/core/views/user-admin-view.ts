import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { PermissionsApi } from "@bitwarden/common/models/api/permissions.api";
// import { OrganizationUserDetailsResponse } from "@bitwarden/common/src/models/response/organization-user.response";

import { CollectionAccessSelectionView } from "./collection-access-selection-view";

export class UserAdminView {
  id: string;
  userId: string;
  organizationId: string;
  type: OrganizationUserType;
  status: OrganizationUserStatusType;
  accessAll: boolean;
  permissions: PermissionsApi;
  resetPasswordEnrolled: boolean;

  collections: CollectionAccessSelectionView[] = [];

  // static fromResponse(response: OrganizationUserDetailsResponse) {
  //   const view = new UserAdminView();
  //   view.id = response.id;
  //   view.userId = response.userId;
  //   view.type = response.type;
  //   view.status = response.status;
  //   view.accessAll = response.accessAll;
  //   view.permissions = response.permissions;
  //   view.resetPasswordEnrolled = response.resetPasswordEnrolled;

  //   return view;
  // }
}
