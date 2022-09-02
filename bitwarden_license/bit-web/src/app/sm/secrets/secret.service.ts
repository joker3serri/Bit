import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";
import { SecretListView } from "@bitwarden/common/models/view/secretListView";
import { SecretView } from "@bitwarden/common/models/view/secretView";

import { CreateSecretRequest } from "./requests/create-secret.request";
import { UpdateSecretRequest } from "./requests/update-secret.request";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";
import { SecretResponse } from "./responses/secret.response";

@Injectable({
  providedIn: "root",
})
export class SecretService {
  protected _secret: BehaviorSubject<SecretView> = new BehaviorSubject(null);

  secret$ = this._secret.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private encryptService: AbstractEncryptService
  ) {}

  async getBySecretId(secretId: string): Promise<SecretView> {
    const r = await this.apiService.send("GET", "/secrets/" + secretId, null, true, true);
    const secretResponse = new SecretResponse(r);
    return await this.decryptSecretView(secretResponse.toSecretView());
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
    const secrets: SecretListView[] = results.data.map(function (result) {
      return result.toSecretListView();
    });
    return await this.decryptSecretsListView(organizationId, secrets);
  }

  async create(organizationId: string, secretView: SecretView) {
    const encryptedSecretView = await this.encryptSecretView(organizationId, secretView);

    const request = new CreateSecretRequest();
    request.organizationId = organizationId;
    request.key = encryptedSecretView.name;
    request.value = encryptedSecretView.value;
    request.note = encryptedSecretView.note;

    const r = await this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/secrets",
      request,
      true,
      true
    );
    this._secret.next(new SecretResponse(r).toSecretView());
  }

  async update(organizationId: string, secretView: SecretView) {
    const encryptedSecretView = await this.encryptSecretView(organizationId, secretView);

    const request = new UpdateSecretRequest();
    request.key = encryptedSecretView.name;
    request.value = encryptedSecretView.value;
    request.note = encryptedSecretView.note;

    const r = await this.apiService.send("PUT", "/secrets/" + secretView.id, request, true, true);
    this._secret.next(new SecretResponse(r).toSecretView());
  }

  private async getOrganizationKey(organizationId: string) {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  private async decryptSecretsListView(organizationId: string, secrets: SecretListView[]) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(organizationId);
    secrets.forEach(async (secrets) => {
      secrets.name = await this.encryptService.decryptToUtf8(new EncString(secrets.name), orgKey);
    });
    return secrets;
  }

  private async encryptSecretView(organizationId: string, secretView: SecretView) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(organizationId);
    secretView.name = (await this.encryptService.encrypt(secretView.name, orgKey)).encryptedString;
    secretView.value = (
      await this.encryptService.encrypt(secretView.value, orgKey)
    ).encryptedString;
    secretView.note = (await this.encryptService.encrypt(secretView.note, orgKey)).encryptedString;
    return secretView;
  }

  private async decryptSecretView(secretView: SecretView) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(secretView.organizationId);
    secretView.name = await this.encryptService.decryptToUtf8(
      new EncString(secretView.name),
      orgKey
    );
    secretView.value = await this.encryptService.decryptToUtf8(
      new EncString(secretView.value),
      orgKey
    );
    secretView.note = await this.encryptService.decryptToUtf8(
      new EncString(secretView.note),
      orgKey
    );
    return secretView;
  }
}
