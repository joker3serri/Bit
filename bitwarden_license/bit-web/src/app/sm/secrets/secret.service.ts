import { Injectable } from "@angular/core";

import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";

import { CreateSecretRequest } from "./requests/create-secret.request";
import { UpdateSecretRequest } from "./requests/update-secret.request";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";
import { SecretResponse } from "./responses/secret.response";

@Injectable({
  providedIn: "any",
})
export class SecretService {
  constructor(
    private cryptoService: CryptoService,
    private encryptService: AbstractEncryptService
  ) {}

  private async getOrganizationKey(organizationId: string) {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  async encryptRequest(organizationId: string, request: CreateSecretRequest | UpdateSecretRequest) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(organizationId);
    request.key = (await this.encryptService.encrypt(request.key, orgKey)).encryptedString;
    request.value = (await this.encryptService.encrypt(request.value, orgKey)).encryptedString;
    request.note = (await this.encryptService.encrypt(request.note, orgKey)).encryptedString;
    return request;
  }

  async decryptSecretResponse(secret: SecretResponse) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(secret.organizationId);
    secret.name = await this.encryptService.decryptToUtf8(new EncString(secret.name), orgKey);
    secret.value = await this.encryptService.decryptToUtf8(new EncString(secret.value), orgKey);
    secret.note = await this.encryptService.decryptToUtf8(new EncString(secret.note), orgKey);
    return secret;
  }

  async decryptSecretIdentifiers(organizationId: string, identifiers: SecretIdentifierResponse[]) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(organizationId);
    identifiers.forEach(async (identifier) => {
      identifier.name = await this.encryptService.decryptToUtf8(
        new EncString(identifier.name),
        orgKey
      );
    });
    return identifiers;
  }
}
