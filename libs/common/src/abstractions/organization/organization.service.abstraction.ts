import { Observable } from "rxjs";

import { OrganizationData } from "../../models/data/organizationData";
import { Organization } from "../../models/domain/organization";

export abstract class OrganizationService {
  organizations$: Observable<Organization[]>;

  get: (id: string) => Organization;
  getByIdentifier: (identifier: string) => Organization;
  getAll: (userId?: string) => Promise<Organization[]>;
  save: (organizations: { [id: string]: OrganizationData }) => Promise<void>;
  canManageSponsorships: () => Promise<boolean>;
  hasOrganizations: (userId?: string) => Promise<boolean>;
}
