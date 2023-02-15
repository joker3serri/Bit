import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";

import { SecretListView } from "../../models/view/secret-list.view";
import { SecretProjectView } from "../../models/view/secret-project.view";
import { SecretView } from "../../models/view/secret.view";
import { SecretListItemResponse } from "../../secrets/responses/secret-list-item.response";
import { SecretProjectResponse } from "../../secrets/responses/secret-project.response";
import { SecretWithProjectsListResponse } from "../../secrets/responses/secret-with-projects-list.response";

import { TrashApiService } from "./trash-api.service";

@Injectable({
  providedIn: "root",
})
export class TrashService {
  protected _secret: Subject<SecretView> = new Subject();

  secret$ = this._secret.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private encryptService: EncryptService,
    private trashApiService: TrashApiService
  ) {}

  async getSecrets(organizationId: string): Promise<SecretListView[]> {
    const results = await this.trashApiService.getSecrets(organizationId);
    return await this.createSecretsListView(organizationId, results);
  }

  async delete(organizationId: string, secretIds: string[]) {
    const responseErrors = await this.trashApiService.deleteSecrets(organizationId, secretIds);

    // TODO waiting to hear back on how to display multiple errors.
    // for now send as a list of strings to be displayed in toast.
    if (responseErrors?.length >= 1) {
      throw new Error(responseErrors.join(","));
    }

    this._secret.next(null);
  }

  async restore(organizationId: string, secretIds: string[]) {
    const responseErrors = await this.trashApiService.restoreSecrets(organizationId, secretIds);

    // TODO waiting to hear back on how to display multiple errors.
    // for now send as a list of strings to be displayed in toast.
    if (responseErrors?.length >= 1) {
      throw new Error(responseErrors.join(","));
    }

    this._secret.next(null);
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  private async createSecretsListView(
    organizationId: string,
    secrets: SecretWithProjectsListResponse
  ): Promise<SecretListView[]> {
    const orgKey = await this.getOrganizationKey(organizationId);

    const projectsMappedToSecretsView = await this.decryptProjectsMappedToSecrets(
      orgKey,
      secrets.projects
    );

    return await Promise.all(
      secrets.secrets.map(async (s: SecretListItemResponse) => {
        const secretListView = new SecretListView();
        secretListView.id = s.id;
        secretListView.organizationId = s.organizationId;
        secretListView.name = await this.encryptService.decryptToUtf8(
          new EncString(s.name),
          orgKey
        );
        secretListView.creationDate = s.creationDate;
        secretListView.revisionDate = s.revisionDate;

        const projectIds = s.projects?.map((p) => p.id);
        secretListView.projects = projectsMappedToSecretsView.filter((p) =>
          projectIds.includes(p.id)
        );

        return secretListView;
      })
    );
  }

  private async decryptProjectsMappedToSecrets(
    orgKey: SymmetricCryptoKey,
    projects: SecretProjectResponse[]
  ): Promise<SecretProjectView[]> {
    return await Promise.all(
      projects.map(async (s: SecretProjectResponse) => {
        const projectsMappedToSecretView = new SecretProjectView();
        projectsMappedToSecretView.id = s.id;
        projectsMappedToSecretView.name = await this.encryptService.decryptToUtf8(
          new EncString(s.name),
          orgKey
        );
        return projectsMappedToSecretView;
      })
    );
  }
}
