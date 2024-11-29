export class SecureArrayBuffer {
  #buffer: ArrayBuffer;

  constructor(byteLength: number) {
    this.#buffer = new ArrayBuffer(byteLength);
  }

  asUint8Array(): Uint8Array {
    return new Uint8Array(this.#buffer);
  }
}
