import { AbstractStorageService } from "../abstractions/storage.service";
import { HtmlStorageLocation } from "../enums";
import { Utils } from "../misc/utils";

import { AppIdService } from "./app-id.service";

describe("AppIdService", () => {
  let storageService: AbstractStorageService;
  let appIdService: AppIdService;

  beforeEach(() => {
    storageService = {
      get: jest.fn(),
      save: jest.fn(),
    } as any;
    appIdService = new AppIdService(storageService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getAppId", () => {
    it("returns the existing appId when it exists", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce("existingAppId");

      const appId = await appIdService.getAppId();

      expect(appId).toBe("existingAppId");
    });

    it("uses the util function to create a new id when it AppId does not exist", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce(null);
      const spy = jest.spyOn(Utils, "newGuid");

      await appIdService.getAppId();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("returns a new appId when it does not exist", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce(null);

      const appId = await appIdService.getAppId();

      expect(appId).toMatch(Utils.guidRegex);
      expect(storageService.save).toHaveBeenCalledWith("appId", appId, {
        htmlStorageLocation: HtmlStorageLocation.Local,
      });
    });

    it("stores the new guid when it an existing one is not found", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce(null);
      (storageService.save as jest.Mock).mockResolvedValueOnce(undefined);

      await appIdService.getAppId();

      expect(storageService.save).toHaveBeenCalledWith(
        "appId",
        expect.stringMatching(Utils.guidRegex),
        {
          htmlStorageLocation: HtmlStorageLocation.Local,
        },
      );
    });
  });

  describe("getAnonymousAppId", () => {
    it("returns the existing appId when it exists", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce("existingAppId");

      const appId = await appIdService.getAnonymousAppId();

      expect(appId).toBe("existingAppId");
    });

    it("uses the util function to create a new id when it AppId does not exist", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce(null);
      const spy = jest.spyOn(Utils, "newGuid");

      await appIdService.getAnonymousAppId();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("returns a new appId when it does not exist", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce(null);

      const appId = await appIdService.getAnonymousAppId();

      expect(appId).toMatch(Utils.guidRegex);
      expect(storageService.save).toHaveBeenCalledWith("anonymousAppId", appId, {
        htmlStorageLocation: HtmlStorageLocation.Local,
      });
    });

    it("stores the new guid when it an existing one is not found", async () => {
      (storageService.get as jest.Mock).mockResolvedValueOnce(null);
      (storageService.save as jest.Mock).mockResolvedValueOnce(undefined);

      await appIdService.getAnonymousAppId();

      expect(storageService.save).toHaveBeenCalledWith(
        "anonymousAppId",
        expect.stringMatching(Utils.guidRegex),
        {
          htmlStorageLocation: HtmlStorageLocation.Local,
        },
      );
    });
  });
});
