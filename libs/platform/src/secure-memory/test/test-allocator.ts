import { SecureMemoryAllocator } from "../secure-memory-allocator";

export class TestAllocator extends SecureMemoryAllocator {
  buffers: ArrayBuffer[] = [];

  allocate = jest.fn().mockImplementation((byteLength) => {
    const buffer = new ArrayBuffer(byteLength);
    this.buffers.push(buffer);
    return buffer;
  });

  clearAll = jest.fn();
}
