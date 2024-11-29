export abstract class SecureMemoryAllocator {
  abstract allocate(byteLength: number): ArrayBuffer;
  abstract clearAll(): void;
}
