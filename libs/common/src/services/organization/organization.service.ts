import { BehaviorSubject, concatMap, filter, map } from "rxjs";

import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationService as OrganizationServiceAbstraction } from "../../abstractions/organization/organization.service.abstraction";
import { StateService } from "../../abstractions/state.service";
import { SyncNotifierService } from "../../abstractions/sync/syncNotifier.service.abstraction";
import { OrganizationData } from "../../models/data/organizationData";
import { isSuccessfullyCompleted } from "../../types/syncEventArgs";

export function getOrganizationById(id: string) {
  return map<Organization[], Organization>((orgs) => orgs.find((o) => o.id === id));
}

export class OrganizationService implements OrganizationServiceAbstraction {
  private _organizations = new BehaviorSubject<Organization[]>([]);

  organizations$ = this._organizations.asObservable();

  constructor(
    private stateService: StateService,
    private syncNotifierService: SyncNotifierService
  ) {
    this.stateService.activeAccountUnlocked$
      .pipe(
        concatMap(async (unlocked) => {
          if (!unlocked) {
            this._organizations.next([]);
            return;
          }

          const data = await this.stateService.getOrganizations();
          this.updateObservables(data);
        })
      )
      .subscribe();

    this.syncNotifierService.sync$
      .pipe(filter(isSuccessfullyCompleted))
      .pipe(
        concatMap(async ({ data }) => {
          const { profile } = data;
          const organizations: { [id: string]: OrganizationData } = {};
          profile.organizations.forEach((o) => {
            organizations[o.id] = new OrganizationData(o);
          });

          profile.providerOrganizations.forEach((o) => {
            if (organizations[o.id] == null) {
              organizations[o.id] = new OrganizationData(o);
              organizations[o.id].isProviderUser = true;
            }
          });

          await this.updateStateAndObservables(organizations);
        })
      )
      .subscribe();
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

    this.updateObservables(organizations);
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

    this.updateObservables(organizations);
    await this.stateService.setOrganizations(organizations);
  }

  get(id: string): Organization {
    const organizations = this._organizations.getValue();

    return organizations.find((organization) => organization.id === id);
  }

  getByIdentifier(identifier: string): Organization {
    const organizations = this._organizations.getValue();

    return organizations.find((organization) => organization.identifier === identifier);
  }

  private async updateStateAndObservables(organizationsMap: { [id: string]: OrganizationData }) {
    await this.stateService.setOrganizations(organizationsMap);
    this.updateObservables(organizationsMap);
  }

  private updateObservables(organizationsMap: { [id: string]: OrganizationData }) {
    const organizations = Object.values(organizationsMap || {}).map((o) => new Organization(o));
    this._organizations.next(organizations);
  }
}
