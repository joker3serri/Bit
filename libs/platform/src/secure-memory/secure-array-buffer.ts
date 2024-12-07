import { getSecureMemoryAllocator } from "./global";

export class SecureArrayBuffer {
  #buffer: ArrayBuffer;

  /** Create a new secure array buffer by cloning the input */
  constructor(buffer: ArrayBuffer);
  /** Create a new secure array buffer with the given byte length */
  constructor(byteLength: number);
  constructor(input: number | ArrayBuffer);
  constructor(input: number | ArrayBuffer) {
    if (input instanceof ArrayBuffer) {
      this.#buffer = getSecureMemoryAllocator().allocate(this, input.byteLength);
      new Uint8Array(this.#buffer).set(new Uint8Array(input));
    } else {
      this.#buffer = getSecureMemoryAllocator().allocate(this, input);
    }
  }

  get buffer() {
    return this.#buffer;
  }

  asUint8Array(): Uint8Array {
    return new Uint8Array(this.#buffer);
  }
}
