import { BehaviorSubject } from "rxjs";

import { Organization } from "@bitwarden/common/models/domain/organization";

import { InternalOrganizationService } from "../../abstractions/organization/organization.service.abstraction";
import { StateService } from "../../abstractions/state.service";
import { Utils } from "../../misc/utils";
import { OrganizationData } from "../../models/data/organizationData";

export class OrganizationService implements InternalOrganizationService {
  private _organizations = new BehaviorSubject<Organization[]>([]);

  organizations$ = this._organizations.asObservable();

  constructor(private stateService: StateService) {
    this.stateService.activeAccountUnlocked$.subscribe(async (unlocked) => {
      if ((Utils.global as any).bitwardenContainerService == null) {
        return;
      }

      if (!unlocked) {
        this._organizations.next([]);
        return;
      }

      const data = await this.stateService.getOrganizations();
      this.updateObservables(data);
    });
  }

  async getAll(userId?: string): Promise<Organization[]> {
    const organizationsMap = await this.stateService.getOrganizations({ userId: userId });
    return Object.values(organizationsMap || {}).map((o) => new Organization(o));
  }

  async canManageSponsorships(): Promise<boolean> {
    const organizations = this._organizations.getValue();
    return organizations.some(
      (o) => o.familySponsorshipAvailable || o.familySponsorshipFriendlyName !== null
    );
  }

  async hasOrganizations(userId?: string): Promise<boolean> {
    const organizations = await this.getAll(userId);
    return organizations.length > 0;
  }

  async save(organizations: { [id: string]: OrganizationData }) {
    return await this.stateService.setOrganizations(organizations);
  }

  async upsert(organization: OrganizationData): Promise<void> {
    let organizations = await this.stateService.getOrganizations();
    if (organizations == null) {
      organizations = {};
    }

    organizations[organization.id] = organization;

    await this.updateObservables(organizations);
    await this.stateService.setOrganizations(organizations);
  }

  async delete(id: string): Promise<void> {
    const organizations = await this.stateService.getOrganizations();
    if (organizations == null) {
      return;
    }

    if (organizations[id] == null) {
      return;
    }

    delete organizations[id];

    await this.updateObservables(organizations);
    await this.stateService.setOrganizations(organizations);
  }

  async get(id: string): Promise<Organization> {
    const organizations = this._organizations.getValue();

    return organizations.find((organization) => organization.id === id);
  }

  async getByIdentifier(identifier: string): Promise<Organization> {
    const organizations = this._organizations.getValue();

    return organizations.find((organization) => organization.identifier === identifier);
  }

  private async updateObservables(organizationsMap: { [id: string]: OrganizationData }) {
    const organizations = Object.values(organizationsMap || {}).map((o) => new Organization(o));
    this._organizations.next(organizations);
  }
}
