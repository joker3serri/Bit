import { SecureUint8Array } from "./secure-uint8-array";

export class SecureString {
  #data: SecureUint8Array;

  /**
   * Construct a secure string by copying the contents of string
   * INSECURE: Prefer constructing from SecureUint8Array to avoid an instance of `string` which
   *           might hang around in memory longer than necessary.
   */
  constructor(input: string);
  /**
   * Construct a secure string by copying the contents of a Uint8Array
   * INSECURE: Prefer constructing from SecureUint8Array to avoid an instance of `string` which
   *           might hang around in memory longer than necessary.
   */
  constructor(input: Uint8Array);
  /**
   * Construct a secure string by copying the contents of a SecureUint8Array
   */
  constructor(input: SecureUint8Array);
  constructor(input: string | Uint8Array) {
    if (typeof input === "string") {
      this.#data = new SecureUint8Array(new TextEncoder().encode(input));
    } else if (input instanceof SecureUint8Array) {
      this.#data = input;
    } else if (input instanceof Uint8Array) {
      this.#data = new SecureUint8Array(input);
    }
  }

  get data() {
    return this.#data;
  }
}
