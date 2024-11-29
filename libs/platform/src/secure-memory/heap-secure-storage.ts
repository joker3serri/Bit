import { SecureMemoryAllocator } from "./secure-memory-allocator";

/**
 * A secure storage implementation that stores data in regular JS heap memory.
 */
export class HeapAllocator extends SecureMemoryAllocator {
  #storage: ArrayBuffer[] = [];

  allocate(byteLength: number): ArrayBuffer {
    const buffer = new ArrayBuffer(byteLength);
    this.#storage.push(buffer);
    return buffer;
  }

  clearAll() {
    this.#storage.forEach((buffer) => {
      const uint8Buffer = new Uint8Array(buffer);
      uint8Buffer.fill(0);
    });
    this.#storage = [];
  }
}
