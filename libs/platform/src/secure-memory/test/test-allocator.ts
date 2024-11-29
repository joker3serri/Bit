import { SecureMemoryAllocator } from "../secure-memory-allocator";

export class TestAllocator extends SecureMemoryAllocator {
  allocate = jest.fn().mockImplementation((byteLength) => {
    new ArrayBuffer(byteLength);
  });
  clearAll = jest.fn();
}
