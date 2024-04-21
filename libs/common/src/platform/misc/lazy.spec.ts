import { Lazy } from "./lazy";

describe("Lazy", () => {
  let factory: jest.Mock<Promise<number>>;
  let lazy: Lazy<number>;

  beforeEach(() => {
    factory = jest.fn();
    lazy = new Lazy(factory);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getValue", () => {
    it("should call the factory once", async () => {
      await lazy.get();
      await lazy.get();

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it("should return the value from the factory", async () => {
      factory.mockResolvedValue(42);

      const value = await lazy.get();

      expect(value).toBe(42);
    });
  });

  describe("factory throws", () => {
    it("should throw the error", async () => {
      factory.mockRejectedValue(new Error("factory error"));

      await expect(lazy.get()).rejects.toThrow("factory error");
    });
  });

  describe("factory returns undefined", () => {
    it("should return undefined", async () => {
      factory.mockResolvedValue(undefined);

      const value = await lazy.get();

      expect(value).toBeUndefined();
    });
  });

  describe("factory returns null", () => {
    it("should return null", async () => {
      factory.mockResolvedValue(null);

      const value = await lazy.get();

      expect(value).toBeNull();
    });
  });

  describe("factory is not async", () => {
    const syncFactory = jest.fn();

    beforeEach(() => {
      syncFactory.mockReturnValue(42);
      lazy = new Lazy(syncFactory);
    });

    it("should return the value from the factory", async () => {
      const value = await lazy.get();

      expect(value).toBe(42);
    });

    it("should call the factory once", async () => {
      await lazy.get();
      await lazy.get();

      expect(syncFactory).toHaveBeenCalledTimes(1);
    });
  });
});
