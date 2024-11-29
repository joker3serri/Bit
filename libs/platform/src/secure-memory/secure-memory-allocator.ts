export abstract class SecureMemoryAllocator {
  /**
   * Allocate a new secure memory buffer, and associate it with the given owner.
   * The owner is used to track the lifetime of the buffer, and ensure it is zeroized when no longer needed.
   */
  abstract allocate(owner: object, byteLength: number): ArrayBuffer;
  abstract clearAll(): void;
}
