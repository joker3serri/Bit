import { TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";

import { SsoClientId } from "@bitwarden/auth/angular";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { DesktopSsoComponentService } from "./desktop-sso-component.service";

describe("DesktopSsoComponentService", () => {
  let service: DesktopSsoComponentService;
  let syncService: MockProxy<SyncService>;

  beforeEach(() => {
    syncService = mock<SyncService>();

    TestBed.configureTestingModule({
      providers: [DesktopSsoComponentService, { provide: SyncService, useValue: syncService }],
    });

    service = TestBed.inject(DesktopSsoComponentService);
  });

  it("sets clientId to desktop", () => {
    expect(service.clientId).toBe(SsoClientId.Desktop);
  });

  it("sets redirectUri to bitwarden://sso-callback", () => {
    expect(service.redirectUri).toBe("bitwarden://sso-callback");
  });

  describe("onSuccessfulLogin", () => {
    it("performs full sync", async () => {
      await service.onSuccessfulLogin();

      expect(syncService.fullSync).toHaveBeenCalledWith(true);
    });
  });

  describe("onSuccessfulLoginTde", () => {
    it("performs full sync", async () => {
      await service.onSuccessfulLoginTde();

      expect(syncService.fullSync).toHaveBeenCalledWith(true);
    });
  });
});
