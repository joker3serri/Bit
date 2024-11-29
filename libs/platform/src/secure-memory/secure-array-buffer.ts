import { getSecureMemoryAllocator } from "./global";

export class SecureArrayBuffer {
  #buffer: ArrayBuffer;

  constructor(byteLength: number) {
    this.#buffer = getSecureMemoryAllocator().allocate(this, byteLength);
  }

  asUint8Array(): Omit<Uint8Array, "buffer"> {
    return new Uint8Array(this.#buffer);
  }
}
