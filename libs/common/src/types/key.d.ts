import { Opaque } from "type-fest";

import { SymmetricCryptoKey } from "../platform/models/domain/symmetric-crypto-key";

// symmetric keys
type DeviceKey = Opaque<SymmetricCryptoKey, "DeviceKey">;
type PrfKey = Opaque<SymmetricCryptoKey, "PrfKey">;
type UserKey = Opaque<SymmetricCryptoKey, "UserKey">;
type MasterKey = Opaque<SymmetricCryptoKey, "MasterKey">;
type PinKey = Opaque<SymmetricCryptoKey, "PinKey">;
type OrgKey = Opaque<SymmetricCryptoKey, "OrgKey">;
type ProviderKey = Opaque<SymmetricCryptoKey, "ProviderKey">;
type CipherKey = Opaque<SymmetricCryptoKey, "CipherKey">;
