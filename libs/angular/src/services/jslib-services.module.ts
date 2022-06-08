import { InjectionToken, Injector, LOCALE_ID, NgModule } from "@angular/core";

import { ApiService as ApiServiceAbstraction } from "@bitwarden/common/src/abstractions/api.service";
import { AppIdService as AppIdServiceAbstraction } from "@bitwarden/common/src/abstractions/appId.service";
import { AuditService as AuditServiceAbstraction } from "@bitwarden/common/src/abstractions/audit.service";
import { AuthService as AuthServiceAbstraction } from "@bitwarden/common/src/abstractions/auth.service";
import { BroadcasterService as BroadcasterServiceAbstraction } from "@bitwarden/common/src/abstractions/broadcaster.service";
import { CipherService as CipherServiceAbstraction } from "@bitwarden/common/src/abstractions/cipher.service";
import { CollectionService as CollectionServiceAbstraction } from "@bitwarden/common/src/abstractions/collection.service";
import { CryptoService as CryptoServiceAbstraction } from "@bitwarden/common/src/abstractions/crypto.service";
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/src/abstractions/cryptoFunction.service";
import { EnvironmentService as EnvironmentServiceAbstraction } from "@bitwarden/common/src/abstractions/environment.service";
import { EventService as EventServiceAbstraction } from "@bitwarden/common/src/abstractions/event.service";
import { ExportService as ExportServiceAbstraction } from "@bitwarden/common/src/abstractions/export.service";
import { FileUploadService as FileUploadServiceAbstraction } from "@bitwarden/common/src/abstractions/fileUpload.service";
import { FolderService as FolderServiceAbstraction } from "@bitwarden/common/src/abstractions/folder.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/src/abstractions/i18n.service";
import { KeyConnectorService as KeyConnectorServiceAbstraction } from "@bitwarden/common/src/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { MessagingService as MessagingServiceAbstraction } from "@bitwarden/common/src/abstractions/messaging.service";
import { NotificationsService as NotificationsServiceAbstraction } from "@bitwarden/common/src/abstractions/notifications.service";
import { OrganizationService as OrganizationServiceAbstraction } from "@bitwarden/common/src/abstractions/organization.service";
import { PasswordGenerationService as PasswordGenerationServiceAbstraction } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "@bitwarden/common/src/abstractions/passwordReprompt.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { PolicyService as PolicyServiceAbstraction } from "@bitwarden/common/src/abstractions/policy.service";
import { ProviderService as ProviderServiceAbstraction } from "@bitwarden/common/src/abstractions/provider.service";
import { SearchService as SearchServiceAbstraction } from "@bitwarden/common/src/abstractions/search.service";
import { SendService as SendServiceAbstraction } from "@bitwarden/common/src/abstractions/send.service";
import { SettingsService as SettingsServiceAbstraction } from "@bitwarden/common/src/abstractions/settings.service";
import { StateService as StateServiceAbstraction } from "@bitwarden/common/src/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "@bitwarden/common/src/abstractions/stateMigration.service";
import { StorageService as StorageServiceAbstraction } from "@bitwarden/common/src/abstractions/storage.service";
import { SyncService as SyncServiceAbstraction } from "@bitwarden/common/src/abstractions/sync.service";
import { TokenService as TokenServiceAbstraction } from "@bitwarden/common/src/abstractions/token.service";
import { TotpService as TotpServiceAbstraction } from "@bitwarden/common/src/abstractions/totp.service";
import { TwoFactorService as TwoFactorServiceAbstraction } from "@bitwarden/common/src/abstractions/twoFactor.service";
import { UserVerificationService as UserVerificationServiceAbstraction } from "@bitwarden/common/src/abstractions/userVerification.service";
import { UsernameGenerationService as UsernameGenerationServiceAbstraction } from "@bitwarden/common/src/abstractions/usernameGeneration.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "@bitwarden/common/src/abstractions/vaultTimeout.service";
import { StateFactory } from "@bitwarden/common/src/factories/stateFactory";
import { Account } from "@bitwarden/common/src/models/domain/account";
import { GlobalState } from "@bitwarden/common/src/models/domain/globalState";
import { ApiService } from "@bitwarden/common/src/services/api.service";
import { AppIdService } from "@bitwarden/common/src/services/appId.service";
import { AuditService } from "@bitwarden/common/src/services/audit.service";
import { AuthService } from "@bitwarden/common/src/services/auth.service";
import { CipherService } from "@bitwarden/common/src/services/cipher.service";
import { CollectionService } from "@bitwarden/common/src/services/collection.service";
import { ConsoleLogService } from "@bitwarden/common/src/services/consoleLog.service";
import { CryptoService } from "@bitwarden/common/src/services/crypto.service";
import { EnvironmentService } from "@bitwarden/common/src/services/environment.service";
import { EventService } from "@bitwarden/common/src/services/event.service";
import { ExportService } from "@bitwarden/common/src/services/export.service";
import { FileUploadService } from "@bitwarden/common/src/services/fileUpload.service";
import { FolderService } from "@bitwarden/common/src/services/folder.service";
import { KeyConnectorService } from "@bitwarden/common/src/services/keyConnector.service";
import { NotificationsService } from "@bitwarden/common/src/services/notifications.service";
import { OrganizationService } from "@bitwarden/common/src/services/organization.service";
import { PasswordGenerationService } from "@bitwarden/common/src/services/passwordGeneration.service";
import { PolicyService } from "@bitwarden/common/src/services/policy.service";
import { ProviderService } from "@bitwarden/common/src/services/provider.service";
import { SearchService } from "@bitwarden/common/src/services/search.service";
import { SendService } from "@bitwarden/common/src/services/send.service";
import { SettingsService } from "@bitwarden/common/src/services/settings.service";
import { StateService } from "@bitwarden/common/src/services/state.service";
import { StateMigrationService } from "@bitwarden/common/src/services/stateMigration.service";
import { SyncService } from "@bitwarden/common/src/services/sync.service";
import { TokenService } from "@bitwarden/common/src/services/token.service";
import { TotpService } from "@bitwarden/common/src/services/totp.service";
import { TwoFactorService } from "@bitwarden/common/src/services/twoFactor.service";
import { UserVerificationService } from "@bitwarden/common/src/services/userVerification.service";
import { UsernameGenerationService } from "@bitwarden/common/src/services/usernameGeneration.service";
import { VaultTimeoutService } from "@bitwarden/common/src/services/vaultTimeout.service";
import { WebCryptoFunctionService } from "@bitwarden/common/src/services/webCryptoFunction.service";

import { AuthGuard } from "../guards/auth.guard";
import { LockGuard } from "../guards/lock.guard";
import { UnauthGuard } from "../guards/unauth.guard";

import { BroadcasterService } from "./broadcaster.service";
import { ModalService } from "./modal.service";
import { PasswordRepromptService } from "./passwordReprompt.service";
import { ValidationService } from "./validation.service";

export const WINDOW = new InjectionToken<Window>("WINDOW");
export const SECURE_STORAGE = new InjectionToken<StorageServiceAbstraction>("SECURE_STORAGE");
export const STATE_FACTORY = new InjectionToken<StateFactory>("STATE_FACTORY");
export const STATE_SERVICE_USE_CACHE = new InjectionToken<boolean>("STATE_SERVICE_USE_CACHE");
export const LOGOUT_CALLBACK = new InjectionToken<(expired: boolean, userId?: string) => void>(
  "LOGOUT_CALLBACK"
);
export const LOCKED_CALLBACK = new InjectionToken<() => void>("LOCKED_CALLBACK");
export const CLIENT_TYPE = new InjectionToken<boolean>("CLIENT_TYPE");
export const LOCALES_DIRECTORY = new InjectionToken<string>("LOCALES_DIRECTORY");
export const SYSTEM_LANGUAGE = new InjectionToken<string>("SYSTEM_LANGUAGE");

@NgModule({
  declarations: [],
  providers: [
    ValidationService,
    AuthGuard,
    UnauthGuard,
    LockGuard,
    ModalService,
    { provide: WINDOW, useValue: window },
    {
      provide: LOCALE_ID,
      useFactory: (i18nService: I18nServiceAbstraction) => i18nService.translationLocale,
      deps: [I18nServiceAbstraction],
    },
    {
      provide: LOCALES_DIRECTORY,
      useValue: "./locales",
    },
    {
      provide: SYSTEM_LANGUAGE,
      useFactory: (window: Window) => window.navigator.language,
      deps: [WINDOW],
    },
    {
      provide: STATE_FACTORY,
      useValue: new StateFactory(GlobalState, Account),
    },
    {
      provide: STATE_SERVICE_USE_CACHE,
      useValue: true,
    },
    {
      provide: LOGOUT_CALLBACK,
      useFactory:
        (messagingService: MessagingServiceAbstraction) => (expired: boolean, userId?: string) =>
          messagingService.send("logout", { expired: expired, userId: userId }),
      deps: [MessagingServiceAbstraction],
    },
    {
      provide: LOCKED_CALLBACK,
      useValue: null,
    },
    {
      provide: AppIdServiceAbstraction,
      useClass: AppIdService,
      deps: [StorageServiceAbstraction],
    },
    {
      provide: AuditServiceAbstraction,
      useClass: AuditService,
      deps: [CryptoFunctionServiceAbstraction, ApiServiceAbstraction],
    },
    {
      provide: AuthServiceAbstraction,
      useClass: AuthService,
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
      ],
    },
    {
      provide: CipherServiceAbstraction,
      useFactory: (
        cryptoService: CryptoServiceAbstraction,
        settingsService: SettingsServiceAbstraction,
        apiService: ApiServiceAbstraction,
        fileUploadService: FileUploadServiceAbstraction,
        i18nService: I18nServiceAbstraction,
        injector: Injector,
        logService: LogService,
        stateService: StateServiceAbstraction
      ) =>
        new CipherService(
          cryptoService,
          settingsService,
          apiService,
          fileUploadService,
          i18nService,
          () => injector.get(SearchServiceAbstraction),
          logService,
          stateService
        ),
      deps: [
        CryptoServiceAbstraction,
        SettingsServiceAbstraction,
        ApiServiceAbstraction,
        FileUploadServiceAbstraction,
        I18nServiceAbstraction,
        Injector, // TODO: Get rid of this circular dependency!
        LogService,
        StateServiceAbstraction,
      ],
    },
    {
      provide: FolderServiceAbstraction,
      useClass: FolderService,
      deps: [
        CryptoServiceAbstraction,
        ApiServiceAbstraction,
        I18nServiceAbstraction,
        CipherServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    { provide: LogService, useFactory: () => new ConsoleLogService(false) },
    {
      provide: CollectionServiceAbstraction,
      useClass: CollectionService,
      deps: [CryptoServiceAbstraction, I18nServiceAbstraction, StateServiceAbstraction],
    },
    {
      provide: EnvironmentServiceAbstraction,
      useClass: EnvironmentService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: TotpServiceAbstraction,
      useClass: TotpService,
      deps: [CryptoFunctionServiceAbstraction, LogService, StateServiceAbstraction],
    },
    { provide: TokenServiceAbstraction, useClass: TokenService, deps: [StateServiceAbstraction] },
    {
      provide: CryptoServiceAbstraction,
      useClass: CryptoService,
      deps: [
        CryptoFunctionServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        LogService,
        StateServiceAbstraction,
      ],
    },
    {
      provide: PasswordGenerationServiceAbstraction,
      useClass: PasswordGenerationService,
      deps: [CryptoServiceAbstraction, PolicyServiceAbstraction, StateServiceAbstraction],
    },
    {
      provide: UsernameGenerationServiceAbstraction,
      useClass: UsernameGenerationService,
      deps: [CryptoServiceAbstraction, StateServiceAbstraction, ApiServiceAbstraction],
    },
    {
      provide: ApiServiceAbstraction,
      useClass: ApiService,
      deps: [
        TokenServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        EnvironmentServiceAbstraction,
        AppIdServiceAbstraction,
        LOGOUT_CALLBACK,
      ],
    },
    {
      provide: FileUploadServiceAbstraction,
      useClass: FileUploadService,
      deps: [LogService, ApiServiceAbstraction],
    },
    {
      provide: SyncServiceAbstraction,
      useClass: SyncService,
      deps: [
        ApiServiceAbstraction,
        SettingsServiceAbstraction,
        FolderServiceAbstraction,
        CipherServiceAbstraction,
        CryptoServiceAbstraction,
        CollectionServiceAbstraction,
        MessagingServiceAbstraction,
        PolicyServiceAbstraction,
        SendServiceAbstraction,
        LogService,
        KeyConnectorServiceAbstraction,
        StateServiceAbstraction,
        OrganizationServiceAbstraction,
        ProviderServiceAbstraction,
        LOGOUT_CALLBACK,
      ],
    },
    { provide: BroadcasterServiceAbstraction, useClass: BroadcasterService },
    {
      provide: SettingsServiceAbstraction,
      useClass: SettingsService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: VaultTimeoutServiceAbstraction,
      useClass: VaultTimeoutService,
      deps: [
        CipherServiceAbstraction,
        FolderServiceAbstraction,
        CollectionServiceAbstraction,
        CryptoServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        MessagingServiceAbstraction,
        SearchServiceAbstraction,
        TokenServiceAbstraction,
        PolicyServiceAbstraction,
        KeyConnectorServiceAbstraction,
        StateServiceAbstraction,
        AuthServiceAbstraction,
        LOCKED_CALLBACK,
        LOGOUT_CALLBACK,
      ],
    },
    {
      provide: StateServiceAbstraction,
      useClass: StateService,
      deps: [
        StorageServiceAbstraction,
        SECURE_STORAGE,
        LogService,
        StateMigrationServiceAbstraction,
        STATE_FACTORY,
        STATE_SERVICE_USE_CACHE,
      ],
    },
    {
      provide: StateMigrationServiceAbstraction,
      useClass: StateMigrationService,
      deps: [StorageServiceAbstraction, SECURE_STORAGE, STATE_FACTORY],
    },
    {
      provide: ExportServiceAbstraction,
      useClass: ExportService,
      deps: [
        FolderServiceAbstraction,
        CipherServiceAbstraction,
        ApiServiceAbstraction,
        CryptoServiceAbstraction,
      ],
    },
    {
      provide: SearchServiceAbstraction,
      useClass: SearchService,
      deps: [CipherServiceAbstraction, LogService, I18nServiceAbstraction],
    },
    {
      provide: NotificationsServiceAbstraction,
      useClass: NotificationsService,
      deps: [
        SyncServiceAbstraction,
        AppIdServiceAbstraction,
        ApiServiceAbstraction,
        EnvironmentServiceAbstraction,
        LOGOUT_CALLBACK,
        LogService,
        StateServiceAbstraction,
        AuthServiceAbstraction,
      ],
    },
    {
      provide: CryptoFunctionServiceAbstraction,
      useClass: WebCryptoFunctionService,
      deps: [WINDOW],
    },
    {
      provide: EventServiceAbstraction,
      useClass: EventService,
      deps: [
        ApiServiceAbstraction,
        CipherServiceAbstraction,
        StateServiceAbstraction,
        LogService,
        OrganizationServiceAbstraction,
      ],
    },
    {
      provide: PolicyServiceAbstraction,
      useClass: PolicyService,
      deps: [StateServiceAbstraction, OrganizationServiceAbstraction, ApiServiceAbstraction],
    },
    {
      provide: SendServiceAbstraction,
      useClass: SendService,
      deps: [
        CryptoServiceAbstraction,
        ApiServiceAbstraction,
        FileUploadServiceAbstraction,
        I18nServiceAbstraction,
        CryptoFunctionServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    {
      provide: KeyConnectorServiceAbstraction,
      useClass: KeyConnectorService,
      deps: [
        StateServiceAbstraction,
        CryptoServiceAbstraction,
        ApiServiceAbstraction,
        TokenServiceAbstraction,
        LogService,
        OrganizationServiceAbstraction,
        CryptoFunctionServiceAbstraction,
        LOGOUT_CALLBACK,
      ],
    },
    {
      provide: UserVerificationServiceAbstraction,
      useClass: UserVerificationService,
      deps: [CryptoServiceAbstraction, I18nServiceAbstraction, ApiServiceAbstraction],
    },
    { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
    {
      provide: OrganizationServiceAbstraction,
      useClass: OrganizationService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: ProviderServiceAbstraction,
      useClass: ProviderService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: TwoFactorServiceAbstraction,
      useClass: TwoFactorService,
      deps: [I18nServiceAbstraction, PlatformUtilsServiceAbstraction],
    },
  ],
})
export class JslibServicesModule {}
