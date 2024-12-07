import { SecureArrayBuffer } from "./secure-array-buffer";

export class SecureUint8Array extends Uint8Array {
  #secureBuffer: SecureArrayBuffer;

  constructor(input: number | ArrayBuffer | Uint8Array) {
    let secureBuffer: SecureArrayBuffer;

    if (input instanceof SecureUint8Array) {
      secureBuffer = input.#secureBuffer;
    } else if (input instanceof Uint8Array) {
      // TODO: probably not the best place for this
      secureBuffer = new SecureArrayBuffer(input.byteLength);
      secureBuffer.asUint8Array().set(input);
    } else {
      secureBuffer = new SecureArrayBuffer(input);
    }

    super(secureBuffer.buffer);
    this.#secureBuffer = secureBuffer;
  }
}
