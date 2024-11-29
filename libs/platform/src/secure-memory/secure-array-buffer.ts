import { getGlobalAllocator } from "./global";

export class SecureArrayBuffer {
  #buffer: ArrayBuffer;

  constructor(byteLength: number) {
    this.#buffer = getGlobalAllocator().allocate(byteLength);
  }

  asUint8Array(): Omit<Uint8Array, "buffer"> {
    return new Uint8Array(this.#buffer);
  }
}
