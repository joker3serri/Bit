import { clearGlobalAllocator, initGlobalAllocator } from "./global";
import { SecureArrayBuffer } from "./secure-array-buffer";
import { TestAllocator } from "./test/test-allocator";

describe("SecureArrayBuffer", () => {
  let allocator: TestAllocator;

  beforeEach(() => {
    allocator = new TestAllocator();
    initGlobalAllocator(allocator);
  });

  afterEach(() => {
    clearGlobalAllocator();
  });

  it("allocates memory using the global allocator", () => {
    new SecureArrayBuffer(10);

    expect(allocator.allocate).toHaveBeenCalledWith(10);
  });
});
