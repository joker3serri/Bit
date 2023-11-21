import { PrfKey } from "../../../platform/models/domain/symmetric-crypto-key";

export abstract class WebAuthnLoginPrfCryptoServiceAbstraction {
  getLoginWithPrfSalt: () => Promise<ArrayBuffer>;
  createSymmetricKeyFromPrf: (prf: ArrayBuffer) => Promise<PrfKey>;
}
