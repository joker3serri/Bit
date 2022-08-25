import { Injectable } from "@angular/core";

import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";

import { CreateSecretRequest } from "./requests/create-secret.request";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";

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

  async encryptCreationRequest(request: CreateSecretRequest) {
    const orgKey: SymmetricCryptoKey = await this.getOrganizationKey(request.organizationId);
    request.key = (await this.encryptService.encrypt(request.key, orgKey)).encryptedString;
    request.value = (await this.encryptService.encrypt(request.value, orgKey)).encryptedString;
    request.note = (await this.encryptService.encrypt(request.note, orgKey)).encryptedString;
    return request;
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
