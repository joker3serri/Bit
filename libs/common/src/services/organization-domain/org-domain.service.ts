import { BehaviorSubject } from "rxjs";

import { OrgDomainInternalServiceAbstraction } from "../../abstractions/organization-domain/org-domain.service.abstraction";
import { OrganizationDomainResponse } from "../../abstractions/organization-domain/responses/organization-domain.response";

export class OrgDomainService implements OrgDomainInternalServiceAbstraction {
  protected _orgDomains$: BehaviorSubject<OrganizationDomainResponse[]> = new BehaviorSubject([]);

  orgDomains$ = this._orgDomains$.asObservable();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async get(orgDomainId: string): Promise<OrganizationDomainResponse> {
    const orgDomains: OrganizationDomainResponse[] = this._orgDomains$.getValue();

    return orgDomains.find((orgDomain) => orgDomain.id === orgDomainId);
  }

  upsert(orgDomains: OrganizationDomainResponse[]): void {
    const existingOrgDomains: OrganizationDomainResponse[] = this._orgDomains$.getValue();

    orgDomains.forEach((orgDomain: OrganizationDomainResponse) => {
      // Determine if passed in orgDomain exists in existing array:
      const index = existingOrgDomains.findIndex(
        (existingOrgDomain) => existingOrgDomain.id === orgDomain.id
      );
      if (index !== -1) {
        // existing
        existingOrgDomains[index] = orgDomain;
      } else {
        // new item
        existingOrgDomains.push(orgDomain);
      }
    });

    this._orgDomains$.next(existingOrgDomains);
  }

  replace(orgDomains: OrganizationDomainResponse[]): void {
    this._orgDomains$.next(orgDomains);
  }

  async clearCache(): Promise<void> {
    this._orgDomains$.next([]);
  }

  delete(orgDomainIds: string[]): void {
    const existingOrgDomains: OrganizationDomainResponse[] = this._orgDomains$.getValue();

    orgDomainIds.forEach((orgDomainId: string) => {
      const index = existingOrgDomains.findIndex(
        (existingOrgDomain) => existingOrgDomain.id === orgDomainId
      );
      if (index !== -1) {
        // existing
        delete existingOrgDomains[index];
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Unable to delete OrgDomainId: ${orgDomainId}`);
      }
    });

    this._orgDomains$.next(existingOrgDomains);
  }
}
