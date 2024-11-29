import { SecureMemoryAllocator } from "./secure-memory-allocator";

let globalAllocator: SecureMemoryAllocator;

export function initGlobalAllocator(allocator: SecureMemoryAllocator) {
  if (globalAllocator) {
    throw new Error("Global allocator is already initialized");
  }

  globalAllocator = allocator;
}

export function getGlobalAllocator(): SecureMemoryAllocator {
  if (!globalAllocator) {
    throw new Error("Global allocator is not initialized");
  }

  return globalAllocator;
}

export function clearGlobalAllocator() {
  globalAllocator?.clearAll();
  globalAllocator = undefined;
}
