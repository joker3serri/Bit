import { SecureHeapAllocator } from "./secure-heap-allocator";
import { SecureMemoryAllocator } from "./secure-memory-allocator";

let globalAllocator: SecureMemoryAllocator;

export function initSecureMemoryAllocator(allocator: SecureMemoryAllocator) {
  if (globalAllocator) {
    throw new Error("Global allocator is already initialized");
  }

  globalAllocator = allocator;
}

export function getSecureMemoryAllocator(): SecureMemoryAllocator {
  if (!globalAllocator) {
    throw new Error("Global allocator is not initialized");
  }

  return globalAllocator;
}

export function clearSecureMemoryAllocator() {
  globalAllocator?.clearAll();
  globalAllocator = undefined;
}

// TODO: This should not be called here, but in the main entry point of the application
initSecureMemoryAllocator(new SecureHeapAllocator());
