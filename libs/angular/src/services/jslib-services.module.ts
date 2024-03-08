import { DOCUMENT } from "@angular/common";
import { LOCALE_ID, NgModule } from "@angular/core";
import { Constructor, UnwrapOpaque } from "type-fest";

import {
  AuthRequestServiceAbstraction,
  AuthRequestService,
  PinCryptoServiceAbstraction,
  PinCryptoService,
  LoginStrategyServiceAbstraction,
  LoginStrategyService,
} from "@bitwarden/auth/common";
import { AvatarUpdateService as AccountUpdateServiceAbstraction } from "@bitwarden/common/abstractions/account/avatar-update.service";
import { ApiService as ApiServiceAbstraction } from "@bitwarden/common/abstractions/api.service";
import { AuditService as AuditServiceAbstraction } from "@bitwarden/common/abstractions/audit.service";
import { EventCollectionService as EventCollectionServiceAbstraction } from "@bitwarden/common/abstractions/event/event-collection.service";
import { EventUploadService as EventUploadServiceAbstraction } from "@bitwarden/common/abstractions/event/event-upload.service";
import { NotificationsService as NotificationsServiceAbstraction } from "@bitwarden/common/abstractions/notifications.service";
import { SearchService as SearchServiceAbstraction } from "@bitwarden/common/abstractions/search.service";
import { SettingsService as SettingsServiceAbstraction } from "@bitwarden/common/abstractions/settings.service";
import { VaultTimeoutSettingsService as VaultTimeoutSettingsServiceAbstraction } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import {
  InternalOrganizationServiceAbstraction,
  OrganizationService as OrganizationServiceAbstraction,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { OrgDomainApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization-domain/org-domain-api.service.abstraction";
import {
  OrgDomainInternalServiceAbstraction,
  OrgDomainServiceAbstraction,
} from "@bitwarden/common/admin-console/abstractions/organization-domain/org-domain.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import {
  InternalPolicyService,
  PolicyService as PolicyServiceAbstraction,
} from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { ProviderService as ProviderServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { OrganizationApiService } from "@bitwarden/common/admin-console/services/organization/organization-api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/services/organization/organization.service";
import { OrgDomainApiService } from "@bitwarden/common/admin-console/services/organization-domain/org-domain-api.service";
import { OrgDomainService } from "@bitwarden/common/admin-console/services/organization-domain/org-domain.service";
import { OrganizationUserServiceImplementation } from "@bitwarden/common/admin-console/services/organization-user/organization-user.service.implementation";
import { PolicyApiService } from "@bitwarden/common/admin-console/services/policy/policy-api.service";
import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { ProviderService } from "@bitwarden/common/admin-console/services/provider.service";
import { AccountApiService as AccountApiServiceAbstraction } from "@bitwarden/common/auth/abstractions/account-api.service";
import {
  AccountService as AccountServiceAbstraction,
  InternalAccountService,
} from "@bitwarden/common/auth/abstractions/account.service";
import { AnonymousHubService as AnonymousHubServiceAbstraction } from "@bitwarden/common/auth/abstractions/anonymous-hub.service";
import { AuthService as AuthServiceAbstraction } from "@bitwarden/common/auth/abstractions/auth.service";
import { DeviceTrustCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust-crypto.service.abstraction";
import { DevicesServiceAbstraction } from "@bitwarden/common/auth/abstractions/devices/devices.service.abstraction";
import { DevicesApiServiceAbstraction } from "@bitwarden/common/auth/abstractions/devices-api.service.abstraction";
import { KeyConnectorService as KeyConnectorServiceAbstraction } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/login.service";
import { PasswordResetEnrollmentServiceAbstraction } from "@bitwarden/common/auth/abstractions/password-reset-enrollment.service.abstraction";
import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { TokenService as TokenServiceAbstraction } from "@bitwarden/common/auth/abstractions/token.service";
import { TwoFactorService as TwoFactorServiceAbstraction } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { UserVerificationApiServiceAbstraction } from "@bitwarden/common/auth/abstractions/user-verification/user-verification-api.service.abstraction";
import { UserVerificationService as UserVerificationServiceAbstraction } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { WebAuthnLoginApiServiceAbstraction } from "@bitwarden/common/auth/abstractions/webauthn/webauthn-login-api.service.abstraction";
import { WebAuthnLoginPrfCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/webauthn/webauthn-login-prf-crypto.service.abstraction";
import { WebAuthnLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/webauthn/webauthn-login.service.abstraction";
import { AccountApiServiceImplementation } from "@bitwarden/common/auth/services/account-api.service";
import { AccountServiceImplementation } from "@bitwarden/common/auth/services/account.service";
import { AnonymousHubService } from "@bitwarden/common/auth/services/anonymous-hub.service";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";
import { DeviceTrustCryptoService } from "@bitwarden/common/auth/services/device-trust-crypto.service.implementation";
import { DevicesServiceImplementation } from "@bitwarden/common/auth/services/devices/devices.service.implementation";
import { DevicesApiServiceImplementation } from "@bitwarden/common/auth/services/devices-api.service.implementation";
import { KeyConnectorService } from "@bitwarden/common/auth/services/key-connector.service";
import { LoginService } from "@bitwarden/common/auth/services/login.service";
import { PasswordResetEnrollmentServiceImplementation } from "@bitwarden/common/auth/services/password-reset-enrollment.service.implementation";
import { SsoLoginService } from "@bitwarden/common/auth/services/sso-login.service";
import { TokenService } from "@bitwarden/common/auth/services/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/services/two-factor.service";
import { UserVerificationApiService } from "@bitwarden/common/auth/services/user-verification/user-verification-api.service";
import { UserVerificationService } from "@bitwarden/common/auth/services/user-verification/user-verification.service";
import { WebAuthnLoginApiService } from "@bitwarden/common/auth/services/webauthn-login/webauthn-login-api.service";
import { WebAuthnLoginPrfCryptoService } from "@bitwarden/common/auth/services/webauthn-login/webauthn-login-prf-crypto.service";
import { WebAuthnLoginService } from "@bitwarden/common/auth/services/webauthn-login/webauthn-login.service";
import {
  AutofillSettingsServiceAbstraction,
  AutofillSettingsService,
} from "@bitwarden/common/autofill/services/autofill-settings.service";
import {
  BadgeSettingsServiceAbstraction,
  BadgeSettingsService,
} from "@bitwarden/common/autofill/services/badge-settings.service";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { OrganizationBillingServiceAbstraction } from "@bitwarden/common/billing/abstractions/organization-billing.service";
import { PaymentMethodWarningsServiceAbstraction } from "@bitwarden/common/billing/abstractions/payment-method-warnings-service.abstraction";
import { BillingApiService } from "@bitwarden/common/billing/services/billing-api.service";
import { OrganizationBillingService } from "@bitwarden/common/billing/services/organization-billing.service";
import { PaymentMethodWarningsService } from "@bitwarden/common/billing/services/payment-method-warnings.service";
import { AppIdService as AppIdServiceAbstraction } from "@bitwarden/common/platform/abstractions/app-id.service";
import { BroadcasterService as BroadcasterServiceAbstraction } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { ConfigApiServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config-api.service.abstraction";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { CryptoService as CryptoServiceAbstraction } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { EnvironmentService as EnvironmentServiceAbstraction } from "@bitwarden/common/platform/abstractions/environment.service";
import { FileUploadService as FileUploadServiceAbstraction } from "@bitwarden/common/platform/abstractions/file-upload/file-upload.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/platform/abstractions/i18n.service";
import { KeyGenerationService as KeyGenerationServiceAbstraction } from "@bitwarden/common/platform/abstractions/key-generation.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService as MessagingServiceAbstraction } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService as StateServiceAbstraction } from "@bitwarden/common/platform/abstractions/state.service";
import { AbstractStorageService } from "@bitwarden/common/platform/abstractions/storage.service";
import { ValidationService as ValidationServiceAbstraction } from "@bitwarden/common/platform/abstractions/validation.service";
import {
  BiometricStateService,
  DefaultBiometricStateService,
} from "@bitwarden/common/platform/biometrics/biometric-state.service";
import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";
import { devFlagEnabled, flagEnabled } from "@bitwarden/common/platform/misc/flags";
import { Account } from "@bitwarden/common/platform/models/domain/account";
import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";
import { AppIdService } from "@bitwarden/common/platform/services/app-id.service";
import { ConfigApiService } from "@bitwarden/common/platform/services/config/config-api.service";
import { ConfigService } from "@bitwarden/common/platform/services/config/config.service";
import { ConsoleLogService } from "@bitwarden/common/platform/services/console-log.service";
import { CryptoService } from "@bitwarden/common/platform/services/crypto.service";
import { EncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/encrypt.service.implementation";
import { MultithreadEncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/multithread-encrypt.service.implementation";
import { EnvironmentService } from "@bitwarden/common/platform/services/environment.service";
import { FileUploadService } from "@bitwarden/common/platform/services/file-upload/file-upload.service";
import { KeyGenerationService } from "@bitwarden/common/platform/services/key-generation.service";
import { MigrationBuilderService } from "@bitwarden/common/platform/services/migration-builder.service";
import { MigrationRunner } from "@bitwarden/common/platform/services/migration-runner";
import { NoopNotificationsService } from "@bitwarden/common/platform/services/noop-notifications.service";
import { StateService } from "@bitwarden/common/platform/services/state.service";
import { StorageServiceProvider } from "@bitwarden/common/platform/services/storage-service.provider";
import { ValidationService } from "@bitwarden/common/platform/services/validation.service";
import { WebCryptoFunctionService } from "@bitwarden/common/platform/services/web-crypto-function.service";
import {
  ActiveUserStateProvider,
  GlobalStateProvider,
  SingleUserStateProvider,
  StateProvider,
  DerivedStateProvider,
} from "@bitwarden/common/platform/state";
/* eslint-disable import/no-restricted-paths -- We need the implementations to inject, but generally these should not be accessed */
import { DefaultActiveUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-active-user-state.provider";
import { DefaultDerivedStateProvider } from "@bitwarden/common/platform/state/implementations/default-derived-state.provider";
import { DefaultGlobalStateProvider } from "@bitwarden/common/platform/state/implementations/default-global-state.provider";
import { DefaultSingleUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-single-user-state.provider";
import { DefaultStateProvider } from "@bitwarden/common/platform/state/implementations/default-state.provider";
import { StateEventRegistrarService } from "@bitwarden/common/platform/state/state-event-registrar.service";
import { StateEventRunnerService } from "@bitwarden/common/platform/state/state-event-runner.service";
/* eslint-enable import/no-restricted-paths */
import { AvatarUpdateService } from "@bitwarden/common/services/account/avatar-update.service";
import { ApiService } from "@bitwarden/common/services/api.service";
import { AuditService } from "@bitwarden/common/services/audit.service";
import { EventCollectionService } from "@bitwarden/common/services/event/event-collection.service";
import { EventUploadService } from "@bitwarden/common/services/event/event-upload.service";
import { NotificationsService } from "@bitwarden/common/services/notifications.service";
import { SearchService } from "@bitwarden/common/services/search.service";
import { SettingsService } from "@bitwarden/common/services/settings.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/services/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutService } from "@bitwarden/common/services/vault-timeout/vault-timeout.service";
import {
  PasswordGenerationService,
  PasswordGenerationServiceAbstraction,
} from "@bitwarden/common/tools/generator/password";
import {
  UsernameGenerationService,
  UsernameGenerationServiceAbstraction,
} from "@bitwarden/common/tools/generator/username";
import {
  PasswordStrengthService,
  PasswordStrengthServiceAbstraction,
} from "@bitwarden/common/tools/password-strength";
import { SendApiService } from "@bitwarden/common/tools/send/services/send-api.service";
import { SendApiService as SendApiServiceAbstraction } from "@bitwarden/common/tools/send/services/send-api.service.abstraction";
import { SendService } from "@bitwarden/common/tools/send/services/send.service";
import {
  InternalSendService,
  SendService as SendServiceAbstraction,
} from "@bitwarden/common/tools/send/services/send.service.abstraction";
import { CipherService as CipherServiceAbstraction } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService as CollectionServiceAbstraction } from "@bitwarden/common/vault/abstractions/collection.service";
import { CipherFileUploadService as CipherFileUploadServiceAbstraction } from "@bitwarden/common/vault/abstractions/file-upload/cipher-file-upload.service";
import { FolderApiServiceAbstraction } from "@bitwarden/common/vault/abstractions/folder/folder-api.service.abstraction";
import {
  FolderService as FolderServiceAbstraction,
  InternalFolderService,
} from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { SyncNotifierService as SyncNotifierServiceAbstraction } from "@bitwarden/common/vault/abstractions/sync/sync-notifier.service.abstraction";
import { SyncService as SyncServiceAbstraction } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { TotpService as TotpServiceAbstraction } from "@bitwarden/common/vault/abstractions/totp.service";
import { VaultSettingsService as VaultSettingsServiceAbstraction } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/services/collection.service";
import { CipherFileUploadService } from "@bitwarden/common/vault/services/file-upload/cipher-file-upload.service";
import { FolderApiService } from "@bitwarden/common/vault/services/folder/folder-api.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";
import { SyncNotifierService } from "@bitwarden/common/vault/services/sync/sync-notifier.service";
import { SyncService } from "@bitwarden/common/vault/services/sync/sync.service";
import { TotpService } from "@bitwarden/common/vault/services/totp.service";
import { VaultSettingsService } from "@bitwarden/common/vault/services/vault-settings/vault-settings.service";
import {
  ImportApiService,
  ImportApiServiceAbstraction,
  ImportService,
  ImportServiceAbstraction,
} from "@bitwarden/importer/core";
import { PasswordRepromptService } from "@bitwarden/vault";
import {
  VaultExportService,
  VaultExportServiceAbstraction,
  OrganizationVaultExportService,
  OrganizationVaultExportServiceAbstraction,
  IndividualVaultExportService,
  IndividualVaultExportServiceAbstraction,
} from "@bitwarden/vault-export-core";

import { AuthGuard } from "../auth/guards/auth.guard";
import { UnauthGuard } from "../auth/guards/unauth.guard";
import { FormValidationErrorsService as FormValidationErrorsServiceAbstraction } from "../platform/abstractions/form-validation-errors.service";
import { BroadcasterService } from "../platform/services/broadcaster.service";
import { FormValidationErrorsService } from "../platform/services/form-validation-errors.service";
import { ThemingService } from "../platform/services/theming/theming.service";
import { AbstractThemingService } from "../platform/services/theming/theming.service.abstraction";
import { SafeProvider, useClass, useFactory, useValue } from "../utils/dependency-helpers";

import {
  LOCALES_DIRECTORY,
  LOCKED_CALLBACK,
  LOG_MAC_FAILURES,
  LOGOUT_CALLBACK,
  MEMORY_STORAGE,
  OBSERVABLE_DISK_STORAGE,
  OBSERVABLE_MEMORY_STORAGE,
  SafeInjectionToken,
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
  SYSTEM_LANGUAGE,
  WINDOW,
} from "./injection-tokens";
import { ModalService } from "./modal.service";

/**
 * An array of provider definitions used in the ngModule.
 * You MUST use a helper function (useValue, useFactory, useClass or useExisting) to define your provider.
 * This ensures that your definition is typesafe.
 * If you need help please ask for it, do NOT change the type of this array.
 */
const typesafeProviders: SafeProvider[] | Constructor<any>[] = [
  AuthGuard,
  UnauthGuard,
  ModalService,
  PasswordRepromptService,
  useValue({ provide: WINDOW, useValue: window }),
  useFactory({
    provide: LOCALE_ID as SafeInjectionToken<string>,
    useFactory: (i18nService: I18nServiceAbstraction) => i18nService.translationLocale,
    deps: [I18nServiceAbstraction],
  }),
  useValue({
    provide: LOCALES_DIRECTORY,
    useValue: "./locales",
  }),
  useFactory({
    provide: SYSTEM_LANGUAGE,
    useFactory: (window: Window) => window.navigator.language,
    deps: [WINDOW],
  }),
  useValue({
    provide: STATE_FACTORY,
    useValue: new StateFactory(GlobalState, Account),
  }),
  useValue({
    provide: STATE_SERVICE_USE_CACHE,
    useValue: true,
  }),
  useFactory({
    provide: LOGOUT_CALLBACK,
    useFactory:
      (messagingService: MessagingServiceAbstraction) => (expired: boolean, userId?: string) =>
        Promise.resolve(messagingService.send("logout", { expired: expired, userId: userId })),
    deps: [MessagingServiceAbstraction],
  }),
  useValue({
    provide: LOCKED_CALLBACK,
    useValue: null,
  }),
  useValue({
    provide: LOG_MAC_FAILURES,
    useValue: true,
  }),
  useClass({
    provide: AppIdServiceAbstraction,
    useClass: AppIdService,
    deps: [AbstractStorageService],
  }),
  useClass({
    provide: AuditServiceAbstraction,
    useClass: AuditService,
    deps: [CryptoFunctionServiceAbstraction, ApiServiceAbstraction],
  }),
  useClass({
    provide: AuditServiceAbstraction,
    useClass: AuditService,
    deps: [CryptoFunctionServiceAbstraction, ApiServiceAbstraction],
  }),
  useClass({
    provide: AuthServiceAbstraction,
    useClass: AuthService,
    deps: [
      MessagingServiceAbstraction,
      CryptoServiceAbstraction,
      ApiServiceAbstraction,
      StateServiceAbstraction,
    ],
  }),
  useClass({
    provide: LoginStrategyServiceAbstraction,
    useClass: LoginStrategyService,
    deps: [
      CryptoServiceAbstraction,
      ApiServiceAbstraction,
      TokenServiceAbstraction,
      AppIdServiceAbstraction,
      PlatformUtilsServiceAbstraction,
      MessagingServiceAbstraction,
      LogService,
      KeyConnectorServiceAbstraction,
      EnvironmentServiceAbstraction,
      StateServiceAbstraction,
      TwoFactorServiceAbstraction,
      I18nServiceAbstraction,
      EncryptService,
      PasswordStrengthServiceAbstraction,
      PolicyServiceAbstraction,
      DeviceTrustCryptoServiceAbstraction,
      AuthRequestServiceAbstraction,
    ],
  }),
  useClass({
    provide: FileUploadServiceAbstraction,
    useClass: FileUploadService,
    deps: [LogService],
  }),
  useClass({
    provide: CipherFileUploadServiceAbstraction,
    useClass: CipherFileUploadService,
    deps: [ApiServiceAbstraction, FileUploadServiceAbstraction],
  }),
  useFactory({
    provide: CipherServiceAbstraction,
    useFactory: (
      cryptoService: CryptoServiceAbstraction,
      settingsService: SettingsServiceAbstraction,
      apiService: ApiServiceAbstraction,
      i18nService: I18nServiceAbstraction,
      searchService: SearchServiceAbstraction,
      stateService: StateServiceAbstraction,
      autofillSettingsService: AutofillSettingsServiceAbstraction,
      encryptService: EncryptService,
      fileUploadService: CipherFileUploadServiceAbstraction,
      configService: ConfigServiceAbstraction,
    ) =>
      new CipherService(
        cryptoService,
        settingsService,
        apiService,
        i18nService,
        searchService,
        stateService,
        autofillSettingsService,
        encryptService,
        fileUploadService,
        configService,
      ),
    deps: [
      CryptoServiceAbstraction,
      SettingsServiceAbstraction,
      ApiServiceAbstraction,
      I18nServiceAbstraction,
      SearchServiceAbstraction,
      StateServiceAbstraction,
      AutofillSettingsServiceAbstraction,
      EncryptService,
      CipherFileUploadServiceAbstraction,
      ConfigServiceAbstraction,
    ],
  }),
  useClass({
    provide: FolderServiceAbstraction,
    useClass: FolderService,
    deps: [
      CryptoServiceAbstraction,
      I18nServiceAbstraction,
      CipherServiceAbstraction,
      StateServiceAbstraction,
      StateProvider,
    ],
  }),
  {
    provide: InternalFolderService,
    useExisting: FolderServiceAbstraction,
  },
  useClass({
    provide: FolderApiServiceAbstraction,
    useClass: FolderApiService,
    deps: [InternalFolderService, ApiServiceAbstraction],
  }),
  useClass({
    provide: AccountApiServiceAbstraction,
    useClass: AccountApiServiceImplementation,
    deps: [
      ApiServiceAbstraction,
      UserVerificationServiceAbstraction,
      LogService,
      InternalAccountService,
    ],
  }),
  useClass({
    provide: AccountServiceAbstraction,
    useClass: AccountServiceImplementation,
    deps: [MessagingServiceAbstraction, LogService, GlobalStateProvider],
  }),
  {
    provide: InternalAccountService,
    useExisting: AccountServiceAbstraction,
  },
  useClass({
    provide: AccountUpdateServiceAbstraction,
    useClass: AvatarUpdateService,
    deps: [ApiServiceAbstraction, StateServiceAbstraction],
  }),
  useFactory({ provide: LogService, useFactory: () => new ConsoleLogService(false), deps: [] }),
  useClass({
    provide: CollectionServiceAbstraction,
    useClass: CollectionService,
    deps: [CryptoServiceAbstraction, I18nServiceAbstraction, StateProvider],
  }),
  useClass({
    provide: EnvironmentServiceAbstraction,
    useClass: EnvironmentService,
    deps: [StateProvider, AccountServiceAbstraction],
  }),
  useClass({
    provide: TotpServiceAbstraction,
    useClass: TotpService,
    deps: [CryptoFunctionServiceAbstraction, LogService],
  }),
  useClass({
    provide: TokenServiceAbstraction,
    useClass: TokenService,
    deps: [StateServiceAbstraction],
  }),
  useClass({
    provide: KeyGenerationServiceAbstraction,
    useClass: KeyGenerationService,
    deps: [CryptoFunctionServiceAbstraction],
  }),
  useClass({
    provide: CryptoServiceAbstraction,
    useClass: CryptoService,
    deps: [
      KeyGenerationServiceAbstraction,
      CryptoFunctionServiceAbstraction,
      EncryptService,
      PlatformUtilsServiceAbstraction,
      LogService,
      StateServiceAbstraction,
      AccountServiceAbstraction,
      StateProvider,
    ],
  }),
  useClass({
    provide: PasswordStrengthServiceAbstraction,
    useClass: PasswordStrengthService,
    deps: [],
  }),
  useClass({
    provide: PasswordGenerationServiceAbstraction,
    useClass: PasswordGenerationService,
    deps: [CryptoServiceAbstraction, PolicyServiceAbstraction, StateServiceAbstraction],
  }),
  useClass({
    provide: UsernameGenerationServiceAbstraction,
    useClass: UsernameGenerationService,
    deps: [CryptoServiceAbstraction, StateServiceAbstraction, ApiServiceAbstraction],
  }),
  useClass({
    provide: ApiServiceAbstraction,
    useClass: ApiService,
    deps: [
      TokenServiceAbstraction,
      PlatformUtilsServiceAbstraction,
      EnvironmentServiceAbstraction,
      AppIdServiceAbstraction,
      LOGOUT_CALLBACK,
    ],
  }),
  {
    provide: InternalSendService,
    useExisting: SendServiceAbstraction,
  },
  useClass({
    provide: SendServiceAbstraction,
    useClass: SendService,
    deps: [
      CryptoServiceAbstraction,
      I18nServiceAbstraction,
      KeyGenerationServiceAbstraction,
      StateServiceAbstraction,
    ],
  }),
  useClass({
    provide: SendApiServiceAbstraction,
    useClass: SendApiService,
    deps: [ApiServiceAbstraction, FileUploadServiceAbstraction, InternalSendService],
  }),
  useClass({
    provide: SyncServiceAbstraction,
    useClass: SyncService,
    deps: [
      ApiServiceAbstraction,
      SettingsServiceAbstraction,
      InternalFolderService,
      CipherServiceAbstraction,
      CryptoServiceAbstraction,
      CollectionServiceAbstraction,
      MessagingServiceAbstraction,
      InternalPolicyService,
      InternalSendService,
      LogService,
      KeyConnectorServiceAbstraction,
      StateServiceAbstraction,
      ProviderServiceAbstraction,
      FolderApiServiceAbstraction,
      InternalOrganizationServiceAbstraction,
      SendApiServiceAbstraction,
      LOGOUT_CALLBACK,
    ],
  }),
  useClass({ provide: BroadcasterServiceAbstraction, useClass: BroadcasterService, deps: [] }),
  useClass({
    provide: SettingsServiceAbstraction,
    useClass: SettingsService,
    deps: [StateServiceAbstraction],
  }),
  useClass({
    provide: VaultTimeoutSettingsServiceAbstraction,
    useClass: VaultTimeoutSettingsService,
    deps: [
      CryptoServiceAbstraction,
      TokenServiceAbstraction,
      PolicyServiceAbstraction,
      StateServiceAbstraction,
      BiometricStateService,
    ],
  }),
  useClass({
    provide: VaultTimeoutService,
    useClass: VaultTimeoutService,
    deps: [
      CipherServiceAbstraction,
      FolderServiceAbstraction,
      CollectionServiceAbstraction,
      CryptoServiceAbstraction,
      PlatformUtilsServiceAbstraction,
      MessagingServiceAbstraction,
      SearchServiceAbstraction,
      StateServiceAbstraction,
      AuthServiceAbstraction,
      VaultTimeoutSettingsServiceAbstraction,
      StateEventRunnerService,
      LOCKED_CALLBACK,
      LOGOUT_CALLBACK,
    ],
  }),
  {
    provide: VaultTimeoutServiceAbstraction,
    useExisting: VaultTimeoutService,
  },
  useClass({
    provide: SsoLoginServiceAbstraction,
    useClass: SsoLoginService,
    deps: [StateProvider],
  }),
  useClass({
    provide: StateServiceAbstraction,
    useClass: StateService,
    deps: [
      AbstractStorageService,
      SECURE_STORAGE,
      MEMORY_STORAGE,
      LogService,
      STATE_FACTORY,
      AccountServiceAbstraction,
      EnvironmentServiceAbstraction,
      MigrationRunner,
      STATE_SERVICE_USE_CACHE,
    ],
  }),
  useClass({
    provide: ImportApiServiceAbstraction,
    useClass: ImportApiService,
    deps: [ApiServiceAbstraction],
  }),
  useClass({
    provide: ImportServiceAbstraction,
    useClass: ImportService,
    deps: [
      CipherServiceAbstraction,
      FolderServiceAbstraction,
      ImportApiServiceAbstraction,
      I18nServiceAbstraction,
      CollectionServiceAbstraction,
      CryptoServiceAbstraction,
    ],
  }),
  useClass({
    provide: IndividualVaultExportServiceAbstraction,
    useClass: IndividualVaultExportService,
    deps: [
      FolderServiceAbstraction,
      CipherServiceAbstraction,
      CryptoServiceAbstraction,
      CryptoFunctionServiceAbstraction,
      StateServiceAbstraction,
    ],
  }),
  useClass({
    provide: OrganizationVaultExportServiceAbstraction,
    useClass: OrganizationVaultExportService,
    deps: [
      CipherServiceAbstraction,
      ApiServiceAbstraction,
      CryptoServiceAbstraction,
      CryptoFunctionServiceAbstraction,
      StateServiceAbstraction,
      CollectionServiceAbstraction,
    ],
  }),
  useClass({
    provide: VaultExportServiceAbstraction,
    useClass: VaultExportService,
    deps: [IndividualVaultExportServiceAbstraction, OrganizationVaultExportServiceAbstraction],
  }),
  useClass({
    provide: SearchServiceAbstraction,
    useClass: SearchService,
    deps: [LogService, I18nServiceAbstraction],
  }),
  useClass({
    provide: NotificationsServiceAbstraction,
    useClass: devFlagEnabled("noopNotifications") ? NoopNotificationsService : NotificationsService,
    deps: [
      LogService,
      SyncServiceAbstraction,
      AppIdServiceAbstraction,
      ApiServiceAbstraction,
      EnvironmentServiceAbstraction,
      LOGOUT_CALLBACK,
      StateServiceAbstraction,
      AuthServiceAbstraction,
      MessagingServiceAbstraction,
    ],
  }),
  useClass({
    provide: CryptoFunctionServiceAbstraction,
    useClass: WebCryptoFunctionService,
    deps: [WINDOW],
  }),
  useFactory({
    provide: EncryptService,
    useFactory: encryptServiceFactory,
    deps: [CryptoFunctionServiceAbstraction, LogService, LOG_MAC_FAILURES],
  }),
  useClass({
    provide: EventUploadServiceAbstraction,
    useClass: EventUploadService,
    deps: [ApiServiceAbstraction, StateServiceAbstraction, LogService],
  }),
  useClass({
    provide: EventCollectionServiceAbstraction,
    useClass: EventCollectionService,
    deps: [
      CipherServiceAbstraction,
      StateServiceAbstraction,
      OrganizationServiceAbstraction,
      EventUploadServiceAbstraction,
    ],
  }),
  useClass({
    provide: PolicyServiceAbstraction,
    useClass: PolicyService,
    deps: [StateProvider, OrganizationServiceAbstraction],
  }),
  {
    provide: InternalPolicyService,
    useExisting: PolicyServiceAbstraction,
  },
  useClass({
    provide: PolicyApiServiceAbstraction,
    useClass: PolicyApiService,
    deps: [InternalPolicyService, ApiServiceAbstraction],
  }),
  useClass({
    provide: KeyConnectorServiceAbstraction,
    useClass: KeyConnectorService,
    deps: [
      StateServiceAbstraction,
      CryptoServiceAbstraction,
      ApiServiceAbstraction,
      TokenServiceAbstraction,
      LogService,
      OrganizationServiceAbstraction,
      KeyGenerationServiceAbstraction,
      LOGOUT_CALLBACK,
    ],
  }),
  useClass({
    provide: UserVerificationServiceAbstraction,
    useClass: UserVerificationService,
    deps: [
      StateServiceAbstraction,
      CryptoServiceAbstraction,
      I18nServiceAbstraction,
      UserVerificationApiServiceAbstraction,
      PinCryptoServiceAbstraction,
      LogService,
      VaultTimeoutSettingsServiceAbstraction,
      PlatformUtilsServiceAbstraction,
    ],
  }),
  useClass({
    provide: OrganizationServiceAbstraction,
    useClass: OrganizationService,
    deps: [StateServiceAbstraction, StateProvider],
  }),
  {
    provide: InternalOrganizationServiceAbstraction,
    useExisting: OrganizationServiceAbstraction,
  },
  useClass({
    provide: OrganizationUserService,
    useClass: OrganizationUserServiceImplementation,
    deps: [ApiServiceAbstraction],
  }),
  useClass({
    provide: PasswordResetEnrollmentServiceAbstraction,
    useClass: PasswordResetEnrollmentServiceImplementation,
    deps: [
      OrganizationApiServiceAbstraction,
      StateServiceAbstraction,
      CryptoServiceAbstraction,
      OrganizationUserService,
      I18nServiceAbstraction,
    ],
  }),
  useClass({
    provide: ProviderServiceAbstraction,
    useClass: ProviderService,
    deps: [StateProvider],
  }),
  useClass({
    provide: TwoFactorServiceAbstraction,
    useClass: TwoFactorService,
    deps: [I18nServiceAbstraction, PlatformUtilsServiceAbstraction],
  }),
  useClass({
    provide: AbstractThemingService,
    useClass: ThemingService,
    deps: [StateServiceAbstraction, WINDOW, DOCUMENT as SafeInjectionToken<Document>],
  }),
  useClass({
    provide: FormValidationErrorsServiceAbstraction,
    useClass: FormValidationErrorsService,
    deps: [],
  }),
  useClass({
    provide: UserVerificationApiServiceAbstraction,
    useClass: UserVerificationApiService,
    deps: [ApiServiceAbstraction],
  }),
  useClass({
    provide: OrganizationApiServiceAbstraction,
    useClass: OrganizationApiService,
    // This is a slightly odd dependency tree for a specialized api service
    // it depends on SyncService so that new data can be retrieved through the sync
    // rather than updating the OrganizationService directly. Instead OrganizationService
    // subscribes to sync notifications and will update itself based on that.
    deps: [ApiServiceAbstraction, SyncServiceAbstraction],
  }),
  useClass({
    provide: SyncNotifierServiceAbstraction,
    useClass: SyncNotifierService,
    deps: [],
  }),
  useClass({
    provide: ConfigService,
    useClass: ConfigService,
    deps: [
      StateServiceAbstraction,
      ConfigApiServiceAbstraction,
      AuthServiceAbstraction,
      EnvironmentServiceAbstraction,
      LogService,
    ],
  }),
  {
    provide: ConfigServiceAbstraction,
    useExisting: ConfigService,
  },
  useClass({
    provide: ConfigApiServiceAbstraction,
    useClass: ConfigApiService,
    deps: [ApiServiceAbstraction, AuthServiceAbstraction],
  }),
  useClass({
    provide: AnonymousHubServiceAbstraction,
    useClass: AnonymousHubService,
    deps: [EnvironmentServiceAbstraction, LoginStrategyServiceAbstraction, LogService],
  }),
  useClass({
    provide: ValidationServiceAbstraction,
    useClass: ValidationService,
    deps: [I18nServiceAbstraction, PlatformUtilsServiceAbstraction],
  }),
  useClass({
    provide: LoginServiceAbstraction,
    useClass: LoginService,
    deps: [StateServiceAbstraction],
  }),
  useClass({
    provide: OrgDomainServiceAbstraction,
    useClass: OrgDomainService,
    deps: [PlatformUtilsServiceAbstraction, I18nServiceAbstraction],
  }),
  {
    provide: OrgDomainInternalServiceAbstraction,
    useExisting: OrgDomainServiceAbstraction,
  },
  useClass({
    provide: OrgDomainApiServiceAbstraction,
    useClass: OrgDomainApiService,
    deps: [OrgDomainInternalServiceAbstraction, ApiServiceAbstraction],
  }),
  useClass({
    provide: DevicesApiServiceAbstraction,
    useClass: DevicesApiServiceImplementation,
    deps: [ApiServiceAbstraction],
  }),
  useClass({
    provide: DevicesServiceAbstraction,
    useClass: DevicesServiceImplementation,
    deps: [DevicesApiServiceAbstraction],
  }),
  useClass({
    provide: DeviceTrustCryptoServiceAbstraction,
    useClass: DeviceTrustCryptoService,
    deps: [
      KeyGenerationServiceAbstraction,
      CryptoFunctionServiceAbstraction,
      CryptoServiceAbstraction,
      EncryptService,
      StateServiceAbstraction,
      AppIdServiceAbstraction,
      DevicesApiServiceAbstraction,
      I18nServiceAbstraction,
      PlatformUtilsServiceAbstraction,
    ],
  }),
  useClass({
    provide: AuthRequestServiceAbstraction,
    useClass: AuthRequestService,
    deps: [
      AppIdServiceAbstraction,
      CryptoServiceAbstraction,
      ApiServiceAbstraction,
      StateServiceAbstraction,
    ],
  }),
  useClass({
    provide: PinCryptoServiceAbstraction,
    useClass: PinCryptoService,
    deps: [
      StateServiceAbstraction,
      CryptoServiceAbstraction,
      VaultTimeoutSettingsServiceAbstraction,
      LogService,
    ],
  }),
  useClass({
    provide: WebAuthnLoginPrfCryptoServiceAbstraction,
    useClass: WebAuthnLoginPrfCryptoService,
    deps: [CryptoFunctionServiceAbstraction],
  }),
  useClass({
    provide: WebAuthnLoginApiServiceAbstraction,
    useClass: WebAuthnLoginApiService,
    deps: [ApiServiceAbstraction, EnvironmentServiceAbstraction],
  }),
  useClass({
    provide: WebAuthnLoginServiceAbstraction,
    useClass: WebAuthnLoginService,
    deps: [
      WebAuthnLoginApiServiceAbstraction,
      LoginStrategyServiceAbstraction,
      WebAuthnLoginPrfCryptoServiceAbstraction,
      WINDOW,
      LogService,
    ],
  }),
  useClass({
    provide: StorageServiceProvider,
    useClass: StorageServiceProvider,
    deps: [OBSERVABLE_DISK_STORAGE, OBSERVABLE_MEMORY_STORAGE],
  }),
  useClass({
    provide: StateEventRegistrarService,
    useClass: StateEventRegistrarService,
    deps: [GlobalStateProvider, StorageServiceProvider],
  }),
  useClass({
    provide: StateEventRunnerService,
    useClass: StateEventRunnerService,
    deps: [GlobalStateProvider, StorageServiceProvider],
  }),
  useClass({
    provide: GlobalStateProvider,
    useClass: DefaultGlobalStateProvider,
    deps: [StorageServiceProvider],
  }),
  useClass({
    provide: ActiveUserStateProvider,
    useClass: DefaultActiveUserStateProvider,
    deps: [AccountServiceAbstraction, StorageServiceProvider, StateEventRegistrarService],
  }),
  useClass({
    provide: SingleUserStateProvider,
    useClass: DefaultSingleUserStateProvider,
    deps: [StorageServiceProvider, StateEventRegistrarService],
  }),
  useClass({
    provide: DerivedStateProvider,
    useClass: DefaultDerivedStateProvider,
    deps: [OBSERVABLE_MEMORY_STORAGE],
  }),
  useClass({
    provide: StateProvider,
    useClass: DefaultStateProvider,
    deps: [
      ActiveUserStateProvider,
      SingleUserStateProvider,
      GlobalStateProvider,
      DerivedStateProvider,
    ],
  }),
  useClass({
    provide: OrganizationBillingServiceAbstraction,
    useClass: OrganizationBillingService,
    deps: [
      CryptoServiceAbstraction,
      EncryptService,
      I18nServiceAbstraction,
      OrganizationApiServiceAbstraction,
    ],
  }),
  useClass({
    provide: AutofillSettingsServiceAbstraction,
    useClass: AutofillSettingsService,
    deps: [StateProvider, PolicyServiceAbstraction],
  }),
  useClass({
    provide: BadgeSettingsServiceAbstraction,
    useClass: BadgeSettingsService,
    deps: [StateProvider],
  }),
  useClass({
    provide: BiometricStateService,
    useClass: DefaultBiometricStateService,
    deps: [StateProvider],
  }),
  useClass({
    provide: VaultSettingsServiceAbstraction,
    useClass: VaultSettingsService,
    deps: [StateProvider],
  }),
  useClass({
    provide: MigrationRunner,
    useClass: MigrationRunner,
    deps: [AbstractStorageService, LogService, MigrationBuilderService],
  }),
  useClass({
    provide: MigrationBuilderService,
    useClass: MigrationBuilderService,
    deps: [],
  }),
  useClass({
    provide: BillingApiServiceAbstraction,
    useClass: BillingApiService,
    deps: [ApiServiceAbstraction],
  }),
  useClass({
    provide: PaymentMethodWarningsServiceAbstraction,
    useClass: PaymentMethodWarningsService,
    deps: [BillingApiServiceAbstraction, StateProvider],
  }),
];

function encryptServiceFactory(
  cryptoFunctionservice: CryptoFunctionServiceAbstraction,
  logService: LogService,
  logMacFailures: boolean,
): EncryptService {
  return flagEnabled("multithreadDecryption")
    ? new MultithreadEncryptServiceImplementation(cryptoFunctionservice, logService, logMacFailures)
    : new EncryptServiceImplementation(cryptoFunctionservice, logService, logMacFailures);
}

@NgModule({
  declarations: [],
  // Do not register your dependency here! Add it to the typesafeProviders array using a helper function
  providers: typesafeProviders as UnwrapOpaque<SafeProvider>[],
})
export class JslibServicesModule {}
