import { map, Observable } from "rxjs";

import { OrganizationUserType } from "@bitwarden/common/admin-console/enums";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

import { OrganizationAuthorizationService } from "./organization-authorization.service";

export class DefaultOrganizationAuthorizationService implements OrganizationAuthorizationService {
  constructor(private configService: ConfigService) {}

  canExport(org: Organization): Observable<boolean> {
    return this.configService
      .getFeatureFlag$(FeatureFlag.PM11360RemoveProviderExportPermission)
      .pipe(
        map((featureFlag) => {
          if (!featureFlag && org.isProviderUser) {
            return true;
          }

          return (
            org.type === OrganizationUserType.Owner ||
            org.type === OrganizationUserType.Admin ||
            org.permissions.accessImportExport
          );
        }),
      );
  }

  canImport(org: Organization) {
    return (
      org.isProviderUser ||
      org.type === OrganizationUserType.Owner ||
      org.type === OrganizationUserType.Admin ||
      org.permissions.accessImportExport ||
      org.canCreateNewCollections // To allow users to create collections and then import items into them
    );
  }
}
