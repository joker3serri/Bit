import { getGlobalAllocator } from "./global";

export class SecureArrayBuffer {
  #buffer: ArrayBuffer;

  constructor(byteLength: number) {
    this.#buffer = getGlobalAllocator().allocate(byteLength);
  }

  asUint8Array(): Uint8Array {
    return new Uint8Array(this.#buffer);
  }
}
