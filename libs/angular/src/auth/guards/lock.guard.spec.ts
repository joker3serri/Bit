import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { MockProxy, mock } from "jest-mock-extended";
import { BehaviorSubject, of } from "rxjs";

import { EmptyComponent } from "@bitwarden/angular/platform/guard/feature-flag.guard.spec";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { AccountInfo, AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { ClientType } from "@bitwarden/common/enums";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { UserId } from "@bitwarden/common/types/guid";

import { lockGuard } from "./lock.guard";

describe("lockGuard", () => {
  let messagingService: MockProxy<MessagingService>;
  const setup = (
    authStatus: AuthenticationStatus,
    canLock: boolean = false,
    isLegacyUser: boolean = false,
    clientType: ClientType = ClientType.Web,
    everHadUserKey: boolean = false,
    supportsDeviceTrust: boolean = false,
    hasMasterPassword: boolean = false,
  ) => {
    const authService: MockProxy<AuthService> = mock<AuthService>();
    authService.authStatusFor$.mockReturnValue(of(authStatus));

    const vaultTimeoutSettingsService: MockProxy<VaultTimeoutSettingsService> =
      mock<VaultTimeoutSettingsService>();
    vaultTimeoutSettingsService.canLock.mockResolvedValue(canLock);

    const cryptoService: MockProxy<CryptoService> = mock<CryptoService>();
    cryptoService.isLegacyUser.mockResolvedValue(isLegacyUser);
    cryptoService.everHadUserKey$ = of(everHadUserKey);

    const platformUtilService: MockProxy<PlatformUtilsService> = mock<PlatformUtilsService>();
    platformUtilService.getClientType.mockReturnValue(clientType);

    messagingService = mock<MessagingService>();

    const deviceTrustService: MockProxy<DeviceTrustServiceAbstraction> =
      mock<DeviceTrustServiceAbstraction>();
    deviceTrustService.supportsDeviceTrust$ = of(supportsDeviceTrust);

    const userVerificationService: MockProxy<UserVerificationService> =
      mock<UserVerificationService>();
    userVerificationService.hasMasterPassword.mockResolvedValue(hasMasterPassword);

    const accountService: MockProxy<AccountService> = mock<AccountService>();
    const activeAccountSubject = new BehaviorSubject<{ id: UserId } & AccountInfo>(null);
    accountService.activeAccount$ = activeAccountSubject;
    activeAccountSubject.next(
      Object.assign(
        {
          name: "Test User 1",
          email: "test@email.com",
          emailVerified: true,
        } as AccountInfo,
        { id: "test-id" as UserId },
      ),
    );

    const testBed = TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: "", component: EmptyComponent },
          { path: "lock", component: EmptyComponent, canActivate: [lockGuard()] },
          { path: "non-lock-route", component: EmptyComponent },
          { path: "migrate-legacy-encryption", component: EmptyComponent },
        ]),
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: MessagingService, useValue: messagingService },
        { provide: AccountService, useValue: accountService },
        { provide: VaultTimeoutSettingsService, useValue: vaultTimeoutSettingsService },
        { provide: CryptoService, useValue: cryptoService },
        { provide: PlatformUtilsService, useValue: platformUtilService },
        { provide: DeviceTrustServiceAbstraction, useValue: deviceTrustService },
        { provide: UserVerificationService, useValue: userVerificationService },
      ],
    });

    return {
      router: testBed.inject(Router),
    };
  };

  it("should be created", () => {
    const { router } = setup(AuthenticationStatus.LoggedOut);
    expect(router).toBeTruthy();
  });

  it("should redirect to the root route when the user is Unlocked", async () => {
    const { router } = setup(AuthenticationStatus.Unlocked);

    await router.navigate(["lock"]);
    expect(router.url).toBe("/");
  });

  it("should redirect to the root route when the user is LoggedOut", async () => {
    const { router } = setup(AuthenticationStatus.LoggedOut);

    await router.navigate(["lock"]);
    expect(router.url).toBe("/");
  });

  it("should allow navigation to the lock route when the user is Locked", async () => {
    const { router } = setup(AuthenticationStatus.Locked);

    await router.navigate(["lock"]);
    expect(router.url).toBe("/lock");
  });

  it("should log user out if they are a legacy user on a desktop client", async () => {
    const { router } = setup(AuthenticationStatus.Locked, true, true, ClientType.Desktop);

    await router.navigate(["lock"]);
    expect(router.url).toBe("/");
    expect(messagingService.send).toHaveBeenCalledWith("logout");
  });

  it("should log user out if they are a legacy user on a browser extension client", async () => {
    const { router } = setup(AuthenticationStatus.Locked, true, true, ClientType.Desktop);

    await router.navigate(["lock"]);
    expect(router.url).toBe("/");
    expect(messagingService.send).toHaveBeenCalledWith("logout");
  });

  it("should send the user to migrate-legacy-encryption if they are a legacy user on a web client", async () => {
    const { router } = setup(AuthenticationStatus.Locked, true, true, ClientType.Web);

    await router.navigate(["lock"]);
    expect(router.url).toBe("/migrate-legacy-encryption");
  });
});
