import { SecureMemoryAllocator } from "./secure-memory-allocator";

/**
 * A secure storage implementation that stores data in regular JS heap memory.
 */
export class SecureHeapAllocator extends SecureMemoryAllocator {
  // #finalizationRegistry = new FinalizationRegistry<ArrayBuffer>((buffer) => this.finalize(buffer));
  #finalizationRegistry: any;
  #storage = new Set<ArrayBuffer>();

  constructor() {
    super();
    this.#finalizationRegistry = new (global as any).FinalizationRegistry((buffer: ArrayBuffer) =>
      this.finalize(buffer),
    );
  }

  allocate(owner: object, byteLength: number): ArrayBuffer {
    const buffer = new ArrayBuffer(byteLength);
    this.#finalizationRegistry.register(owner, buffer);
    this.#storage.add(buffer);
    return buffer;
  }

  clearAll() {
    this.#storage.forEach((buffer) => {
      this.finalize(buffer);
    });
    this.#storage.clear();
  }

  private finalize(buffer: ArrayBuffer) {
    if (!this.#storage.has(buffer)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log("Zeroizing buffer");

    new Uint8Array(buffer).fill(0);
    this.#storage.delete(buffer);
  }
}
