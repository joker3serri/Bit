import { WebPlatformUtilsService } from "./web-platform-utils.service";

describe("Web Platform Utils Service", () => {
  let webPlatformUtilsService: WebPlatformUtilsService;

  beforeEach(() => {
    webPlatformUtilsService = new WebPlatformUtilsService(null, null, null);
  });

  afterEach(() => {
    delete process.env.APPLICATION_VERSION;
  });

  describe("getApplicationVersion", () => {
    test("{version number}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2";

      const result = await webPlatformUtilsService.getApplicationVersion();
      expect(result).toBe("2022.10.2");
    });

    test("{version number} - {git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2 - 5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersion();
      expect(result).toBe("2022.10.2 - 5f8c1c1");
    });

    test("{version number}-{git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2-5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersion();
      expect(result).toBe("2022.10.2-5f8c1c1");
    });

    test("{version number} + {git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2 + 5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersion();
      expect(result).toBe("2022.10.2 + 5f8c1c1");
    });

    test("{version number}+{git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2+5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersion();
      expect(result).toBe("2022.10.2+5f8c1c1");
    });
  });

  describe("getApplicationVersionNumber", () => {
    test("{version number}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2";

      const result = await webPlatformUtilsService.getApplicationVersionNumber();
      expect(result).toBe("2022.10.2");
    });

    test("{version number} - {git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2 - 5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersionNumber();
      expect(result).toBe("2022.10.2");
    });

    test("{version number}-{git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2-5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersionNumber();
      expect(result).toBe("2022.10.2");
    });

    test("{version number} + {git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2 + 5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersionNumber();
      expect(result).toBe("2022.10.2");
    });

    test("{version number}+{git hash}", async () => {
      process.env.APPLICATION_VERSION = "2022.10.2+5f8c1c1";

      const result = await webPlatformUtilsService.getApplicationVersionNumber();
      expect(result).toBe("2022.10.2");
    });
  });
});
