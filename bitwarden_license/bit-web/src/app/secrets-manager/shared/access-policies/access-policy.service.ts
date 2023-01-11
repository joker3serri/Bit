import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";

import {
  GroupProjectAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";

import {
  GroupProjectAccessPolicyResponse,
  ServiceAccountProjectAccessPolicyResponse,
  UserProjectAccessPolicyResponse,
} from "./models/responses/access-policy.response";
import { ProjectAccessPoliciesResponse } from "./models/responses/project-access-policies.response";

@Injectable({
  providedIn: "root",
})
export class AccessPolicyService {
  protected _projectAccessPolicies = new Subject<ProjectAccessPoliciesView>();
  projectAccessPolicies$ = this._projectAccessPolicies.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private encryptService: EncryptService
  ) {}

  async getProjectAccessPolicies(organizationId: string, projectId: string) {
    const r = await this.apiService.send(
      "GET",
      "/projects/" + projectId + "/access-policies",
      null,
      true,
      true
    );

    const results = new ProjectAccessPoliciesResponse(r);
    return await this.createProjectAccessPoliciesView(organizationId, results);
  }

  async deleteAccessPolicy(accessPolicyId: string) {
    await this.apiService.send("DELETE", "/access-policies/" + accessPolicyId, null, true, false);
    this._projectAccessPolicies.next(null);
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  private async createProjectAccessPoliciesView(
    organizationId: string,
    projectAccessPoliciesResponse: ProjectAccessPoliciesResponse
  ): Promise<ProjectAccessPoliciesView> {
    const orgKey = await this.getOrganizationKey(organizationId);
    const view = new ProjectAccessPoliciesView();

    view.userAccessPolicies = projectAccessPoliciesResponse.userAccessPolicies.map((ap) => {
      return this.createUserProjectAccessPolicyView(ap);
    });

    view.serviceAccountAccessPolicies = await Promise.all(
      projectAccessPoliciesResponse.serviceAccountAccessPolicies.map((ap) => {
        return this.createServiceAccountProjectAccessPolicyView(orgKey, ap);
      })
    );

    view.groupAccessPolicies = await Promise.all(
      projectAccessPoliciesResponse.groupAccessPolicies.map((ap) => {
        return this.createGroupProjectAccessPolicyView(orgKey, ap);
      })
    );

    return view;
  }

  private createUserProjectAccessPolicyView(
    response: UserProjectAccessPolicyResponse
  ): UserProjectAccessPolicyView {
    return {
      id: response.id,
      read: response.read,
      write: response.write,
      creationDate: response.creationDate,
      revisionDate: response.revisionDate,
      grantedProjectId: response.grantedProjectId,
      organizationUserId: response.organizationUserId,
      organizationUserName: response.organizationUserName,
    };
  }

  private async createGroupProjectAccessPolicyView(
    organizationKey: SymmetricCryptoKey,
    response: GroupProjectAccessPolicyResponse
  ): Promise<GroupProjectAccessPolicyView> {
    return {
      id: response.id,
      read: response.read,
      write: response.write,
      creationDate: response.creationDate,
      revisionDate: response.revisionDate,
      grantedProjectId: response.grantedProjectId,
      groupId: response.groupId,
      groupName: await this.encryptService.decryptToUtf8(
        new EncString(response.groupName),
        organizationKey
      ),
    };
  }

  private async createServiceAccountProjectAccessPolicyView(
    organizationKey: SymmetricCryptoKey,
    response: ServiceAccountProjectAccessPolicyResponse
  ): Promise<ServiceAccountProjectAccessPolicyView> {
    return {
      id: response.id,
      read: response.read,
      write: response.write,
      creationDate: response.creationDate,
      revisionDate: response.revisionDate,
      grantedProjectId: response.grantedProjectId,
      serviceAccountId: response.serviceAccountId,
      serviceAccountName: await this.encryptService.decryptToUtf8(
        new EncString(response.serviceAccountName),
        organizationKey
      ),
    };
  }
}
