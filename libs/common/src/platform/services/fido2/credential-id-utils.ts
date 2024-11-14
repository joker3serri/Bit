import { Fido2Utils } from "./fido2-utils";
import { guidToRawFormat } from "./guid-utils";

export function parseCredentialId(encodedCredentialId: string): Uint8Array {
  try {
    if (encodedCredentialId.startsWith("b64.")) {
      return Fido2Utils.stringToBuffer(encodedCredentialId.slice(4));
    }

    return guidToRawFormat(encodedCredentialId);
  } catch {
    return undefined;
  }
}
