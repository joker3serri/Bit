import { Observable } from "rxjs";

import { OrganizationDomainResponse } from "./responses/organization-domain.response";

export abstract class OrgDomainServiceAbstraction {
  orgDomains$: Observable<OrganizationDomainResponse[]>;

  get: (orgDomainId: string) => Promise<OrganizationDomainResponse>;
}

// Note: this separate class is designed to hold methods that are not
// meant to be used in components (e.g., data write methods)
export abstract class OrgDomainInternalServiceAbstraction extends OrgDomainServiceAbstraction {
  upsert: (orgDomains: OrganizationDomainResponse[]) => void;
  replace: (orgDomains: OrganizationDomainResponse[]) => void;
  clearCache: () => Promise<void>;
  delete: (orgDomainIds: string[]) => void;
}
