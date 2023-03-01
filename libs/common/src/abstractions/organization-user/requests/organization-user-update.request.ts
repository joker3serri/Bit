import { OrganizationUserType } from "../../../admin-console/enums/organizationUserType";
import { SelectionReadOnlyRequest } from "../../../admin-console/models/request/selection-read-only.request";
import { PermissionsApi } from "../../../models/api/permissions.api";

export class OrganizationUserUpdateRequest {
  type: OrganizationUserType;
  accessAll: boolean;
  accessSecretsManager: boolean;
  collections: SelectionReadOnlyRequest[] = [];
  groups: string[] = [];
  permissions: PermissionsApi;
}
