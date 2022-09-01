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
  providedIn: "any",
})
export class SecretService {
  protected _secrets: BehaviorSubject<SecretListView[]> = new BehaviorSubject([]);

  secrets$ = this._secrets.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private encryptService: AbstractEncryptService
  ) {}
  async init(organizationId: string) {
    await this.updateObservables(organizationId);
  }

  async create(organizationId: string, secretView: SecretView) {
    const encryptedSecretView = await this.encryptSecretView(organizationId, secretView);

    const request = new CreateSecretRequest();
    request.organizationId = organizationId;
    request.key = encryptedSecretView.name;
    request.value = encryptedSecretView.value;
    request.note = encryptedSecretView.note;

    await this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/secrets",
      request,
      true,
      true
    );
    // Trigger observable to refetch secrets list
    await this.updateObservables(organizationId);
  }

  async update(organizationId: string, secretView: SecretView) {
    const encryptedSecretView = await this.encryptSecretView(organizationId, secretView);

    const request = new UpdateSecretRequest();
    request.key = encryptedSecretView.name;
    request.value = encryptedSecretView.value;
    request.note = encryptedSecretView.note;

    await this.apiService.send("PUT", "/secrets/" + secretView.id, request, true, true);
    // Trigger observable to refetch secrets list
    await this.updateObservables(organizationId);
  }

  async getBySecretId(secretId: string): Promise<SecretView> {
    const r = await this.apiService.send("GET", "/secrets/" + secretId, null, true, true);
    let secretResponse = new SecretResponse(r);
    secretResponse = await this.decryptSecretResponse(secretResponse);
    const secretView = new SecretView();
    secretView.id = secretResponse.id;
    secretView.organizationId = secretResponse.organizationId;
    secretView.name = secretResponse.name;
    secretView.value = secretResponse.value;
    secretView.note = secretResponse.note;
    secretView.creationDate = secretResponse.creationDate;
    secretView.revisionDate = secretResponse.revisionDate;
    return secretView;
  }

  private async updateObservables(organizationId: string) {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/secrets",
      null,
      true,
      true
    );
    const results = new ListResponse(r, SecretIdentifierResponse);
    let secrets: SecretListView[] = results.data.map(function (result) {
      const secret = new SecretListView();
      secret.id = result.id;
      secret.organizationId = result.organizationId;
      secret.name = result.name;
      secret.creationDate = result.creationDate;
      secret.revisionDate = result.revisionDate;
      return secret;
    });
    secrets = await this.decryptSecretListView(organizationId, secrets);
    //console.log("calling observable update");
    this._secrets.next(secrets);
  }

  private async decryptSecretListView(organizationId: string, secrets: SecretListView[]) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(organizationId);
    secrets.forEach(async (secrets) => {
      secrets.name = await this.encryptService.decryptToUtf8(new EncString(secrets.name), orgKey);
    });
    return secrets;
  }

  private async getOrganizationKey(organizationId: string) {
    return await this.cryptoService.getOrgKey(organizationId);
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

  private async decryptSecretResponse(secret: SecretResponse) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(secret.organizationId);
    secret.name = await this.encryptService.decryptToUtf8(new EncString(secret.name), orgKey);
    secret.value = await this.encryptService.decryptToUtf8(new EncString(secret.value), orgKey);
    secret.note = await this.encryptService.decryptToUtf8(new EncString(secret.note), orgKey);
    return secret;
  }
}
