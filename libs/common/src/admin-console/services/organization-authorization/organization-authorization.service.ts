import { Observable } from "rxjs";

import { Organization } from "../../models/domain/organization";

export abstract class OrganizationAuthorizationService {
  canExport: (org: Organization) => Observable<boolean>;
  canImport: (org: Organization) => boolean;
}
