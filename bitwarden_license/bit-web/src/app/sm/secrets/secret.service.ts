import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";
import { SecretListView } from "@bitwarden/common/models/view/secretListView";
import { SecretView } from "@bitwarden/common/models/view/secretView";

import { SecretRequest } from "./requests/secret.request";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";
import { SecretResponse } from "./responses/secret.response";

@Injectable({
  providedIn: "root",
})
export class SecretService {
  protected _secret: Subject<SecretView> = new Subject();

  secret$ = this._secret.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private encryptService: AbstractEncryptService
  ) {}

  async getBySecretId(secretId: string): Promise<SecretView> {
    const r = await this.apiService.send("GET", "/secrets/" + secretId, null, true, true);
    const secretResponse = new SecretResponse(r);
    return await this.getSecretView(secretResponse);
  }

  async getSecrets(organizationId: string): Promise<SecretListView[]> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/secrets",
      null,
      true,
      true
    );
    const results = new ListResponse(r, SecretIdentifierResponse);
    return await this.getSecretsListView(organizationId, results.data);
  }

  async create(organizationId: string, secretView: SecretView) {
    const request = await this.getSecretRequest(organizationId, secretView);
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/secrets",
      request,
      true,
      true
    );
    this._secret.next(await this.getSecretView(new SecretResponse(r)));
  }

  async update(organizationId: string, secretView: SecretView) {
    const request = await this.getSecretRequest(organizationId, secretView);
    const r = await this.apiService.send("PUT", "/secrets/" + secretView.id, request, true, true);
    this._secret.next(await this.getSecretView(new SecretResponse(r)));
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  private async getSecretRequest(
    organizationId: string,
    secretView: SecretView
  ): Promise<SecretRequest> {
    const orgKey = await this.getOrganizationKey(organizationId);
    const request = new SecretRequest();
    const keyPromise = this.encryptService.encrypt(secretView.name, orgKey);
    const valuePromise = this.encryptService.encrypt(secretView.value, orgKey);
    const notePromise = this.encryptService.encrypt(secretView.note, orgKey);
    await Promise.all([keyPromise, valuePromise, notePromise]).then(([key, value, note]) => {
      request.key = key.encryptedString;
      request.value = value.encryptedString;
      request.note = note.encryptedString;
    });
    return request;
  }

  private async getSecretView(secretResponse: SecretResponse): Promise<SecretView> {
    const orgKey = await this.getOrganizationKey(secretResponse.organizationId);
    const secretView = new SecretView();
    secretView.id = secretResponse.id;
    secretView.organizationId = secretResponse.organizationId;
    secretView.creationDate = secretResponse.creationDate;
    secretView.revisionDate = secretResponse.revisionDate;
    const namePromise = this.encryptService.decryptToUtf8(
      new EncString(secretResponse.name),
      orgKey
    );
    const valuePromise = this.encryptService.decryptToUtf8(
      new EncString(secretResponse.value),
      orgKey
    );
    const notePromise = this.encryptService.decryptToUtf8(
      new EncString(secretResponse.note),
      orgKey
    );
    await Promise.all([namePromise, valuePromise, notePromise]).then(([name, value, note]) => {
      secretView.name = name;
      secretView.value = value;
      secretView.note = note;
    });
    return secretView;
  }

  private async getSecretsListView(
    organizationId: string,
    secrets: SecretIdentifierResponse[]
  ): Promise<SecretListView[]> {
    const orgKey = await this.getOrganizationKey(organizationId);
    return await Promise.all(
      secrets.map(async (s: SecretIdentifierResponse) => {
        const secretListView = new SecretListView();
        secretListView.id = s.id;
        secretListView.organizationId = s.organizationId;
        secretListView.name = await this.encryptService.decryptToUtf8(
          new EncString(s.name),
          orgKey
        );
        secretListView.creationDate = s.creationDate;
        secretListView.revisionDate = s.revisionDate;
        return secretListView;
      })
    );
  }
}
