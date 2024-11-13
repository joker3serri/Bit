import { TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { Subject } from "rxjs";

import { LoginApprovalComponent } from "@bitwarden/auth/angular";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/platform/abstractions/i18n.service";

import { DesktopLoginApprovalService } from "./desktop-login-approval.service";

describe("DesktopLoginApprovalService", () => {
  let service: DesktopLoginApprovalService;
  let i18nService: MockProxy<I18nServiceAbstraction>;

  beforeEach(() => {
    (global as any).desktopApi = {
      auth: {
        loginRequest: jest.fn(),
      },
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    i18nService = mock<I18nServiceAbstraction>({
      t: jest.fn(),
      userSetLocale$: new Subject<string>(),
      locale$: new Subject<string>(),
    });

    TestBed.configureTestingModule({
      providers: [
        DesktopLoginApprovalService,
        { provide: I18nServiceAbstraction, useValue: i18nService },
      ],
    });

    service = TestBed.inject(DesktopLoginApprovalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).desktopApi;
  });

  it("is created successfully", () => {
    expect(service).toBeTruthy();
  });

  it("calls ipc.auth.loginRequest with correct parameters on onInit", async () => {
    const title = "Log in requested";
    const email = "test@bitwarden.com";
    const message = `Confirm login attempt for ${email}`;
    const closeText = "Close";

    const loginApprovalComponent = { email } as LoginApprovalComponent;
    i18nService.t.mockImplementation((key: string) => {
      switch (key) {
        case "logInRequested":
          return title;
        case "confirmLoginAtemptForMail":
          return message;
        case "close":
          return closeText;
        default:
          return "";
      }
    });

    jest.spyOn(ipc.auth, "loginRequest").mockResolvedValue();

    await service.onInit(loginApprovalComponent);

    expect(ipc.auth.loginRequest).toHaveBeenCalledWith(title, message, closeText);
  });
});
