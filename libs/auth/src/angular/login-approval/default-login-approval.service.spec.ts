import { TestBed } from "@angular/core/testing";

import { DefaultLoginApprovalService } from "./default-login-approval.service";
import { LoginApprovalComponent } from "./login-approval.component";

describe("DefaultLoginApprovalService", () => {
  let service: DefaultLoginApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultLoginApprovalService],
    });

    service = TestBed.inject(DefaultLoginApprovalService);
  });

  it("is created successfully", () => {
    expect(service).toBeTruthy();
  });

  it("has onInit that is a no-op", async () => {
    const loginApprovalComponent = {} as LoginApprovalComponent;
    await service.onInit(loginApprovalComponent);
  });
});
