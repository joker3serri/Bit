import { EncryptedOrganizationKeyData } from "../../../admin-console/models/data/encrypted-organization-key.data";
import { BaseEncryptedOrganizationKey } from "../../../admin-console/models/domain/encrypted-organization-key";
import { OrganizationId } from "../../../types/guid";
import { OrgKey, UserPrivateKey } from "../../../types/key";
import { EncryptService } from "../../abstractions/encrypt.service";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { CRYPTO_DISK, CRYPTO_MEMORY, DeriveDefinition, UserKeyDefinition } from "../../state";

export const USER_ENCRYPTED_ORGANIZATION_KEYS = UserKeyDefinition.record<
  EncryptedOrganizationKeyData,
  OrganizationId
>(CRYPTO_DISK, "organizationKeys", {
  deserializer: (obj) => obj,
  clearOn: ["logout"],
});

export const USER_ORGANIZATION_KEYS = new DeriveDefinition<
  [Record<OrganizationId, EncryptedOrganizationKeyData>, UserPrivateKey],
  Record<OrganizationId, OrgKey>,
  { encryptService: EncryptService }
>(CRYPTO_MEMORY, "organizationKeys", {
  deserializer: (obj) => {
    const result: Record<OrganizationId, OrgKey> = {};
    for (const orgId of Object.keys(obj ?? {}) as OrganizationId[]) {
      result[orgId] = SymmetricCryptoKey.fromJSON(obj[orgId]) as OrgKey;
    }
    return result;
  },
  derive: async ([encryptedOrgKeys, privateKey], { encryptService }) => {
    const result: Record<OrganizationId, OrgKey> = {};
    for (const orgId of Object.keys(encryptedOrgKeys ?? {}) as OrganizationId[]) {
      if (result[orgId] != null) {
        continue;
      }
      const encrypted = BaseEncryptedOrganizationKey.fromData(encryptedOrgKeys[orgId]);

      const decrypted = await encryptService.rsaDecrypt(
        encrypted.encryptedOrganizationKey,
        privateKey,
      );

      result[orgId] = new SymmetricCryptoKey(decrypted) as OrgKey;
    }

    return result;
  },
});
