import { Pipe } from "@angular/core";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { Utils } from "@bitwarden/common/misc/utils";

@Pipe({
  name: "fingerprint",
})
export class FingerprintPipe {
  constructor(private cryptoService: CryptoService) {}

  async transform(publicKey: string | Uint8Array, userId: string): Promise<string> {
    try {
      if (typeof publicKey === "string") {
        publicKey = Utils.fromB64ToArray(publicKey);
      }

      const fingerprint = await this.cryptoService.getFingerprint(userId, publicKey.buffer);

      if (fingerprint != null) {
        return fingerprint.join("-");
      }

      return "";
    } catch {
      return "";
    }
  }
}
