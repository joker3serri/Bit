import { Cipher } from "../../vault/models/domain/cipher";

import { CipherRequest } from "./cipher.request";

export class CipherShareRequest {
  cipher: CipherRequest;
  collectionIds: string[];

  constructor(cipher: Cipher) {
    this.cipher = new CipherRequest(cipher);
    this.collectionIds = cipher.collectionIds;
  }
}
