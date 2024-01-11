import { EncryptedOrganizationKeyData } from "../../../admin-console/models/data/encrypted-organization-key.data";
import { BaseEncryptedOrganizationKey } from "../../../admin-console/models/domain/encrypted-organization-key";
import { OrgId } from "../../../types/guid";
import { CryptoService } from "../../abstractions/crypto.service";
import { OrgKey, SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { KeyDefinition, CRYPTO_DISK, DeriveDefinition } from "../../state";

export const USER_ENCRYPTED_ORGANIZATION_KEYS = KeyDefinition.record<
  EncryptedOrganizationKeyData,
  OrgId
>(CRYPTO_DISK, "organizationKeys", {
  deserializer: (obj) => obj,
});

export const USER_ORGANIZATION_KEYS = DeriveDefinition.from<
  Record<OrgId, EncryptedOrganizationKeyData>,
  Record<OrgId, OrgKey>,
  { cryptoService: CryptoService }
>(USER_ENCRYPTED_ORGANIZATION_KEYS, {
  deserializer: (obj) => {
    const result: Record<OrgId, OrgKey> = {};
    for (const orgId of Object.keys(obj ?? {}).map((x) => x as OrgId)) {
      result[orgId] = SymmetricCryptoKey.fromJSON(obj[orgId]) as OrgKey;
    }
    return result;
  },
  derive: async (from, { cryptoService }) => {
    const result: Record<OrgId, OrgKey> = {};
    for (const orgId of Object.keys(from ?? {}).map((x) => x as OrgId)) {
      if (result[orgId] != null) {
        continue;
      }
      const encrypted = BaseEncryptedOrganizationKey.fromData(from[orgId]);
      const decrypted = await encrypted.decrypt(cryptoService);

      result[orgId] = decrypted;
    }

    return result;
  },
});
