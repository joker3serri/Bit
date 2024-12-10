import { TestBed } from "@angular/core/testing";

import { DesktopSsoComponentService } from "./desktop-sso-component.service";

describe("DesktopSsoComponentService", () => {
  let service: DesktopSsoComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DesktopSsoComponentService],
    });
    service = TestBed.inject(DesktopSsoComponentService);
  });

  it("creates the service", () => {
    expect(service).toBeTruthy();
  });
});
