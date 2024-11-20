import * as fs from "fs";
import * as path from "path";

import * as jsdom from "jsdom";
import { firstValueFrom, map } from "rxjs";

import {
  OrganizationUserApiService,
  DefaultOrganizationUserApiService,
  DefaultCollectionService,
} from "@bitwarden/admin-console/common";
import {
  InternalUserDecryptionOptionsServiceAbstraction,
  AuthRequestService,
  LoginStrategyService,
  LoginStrategyServiceAbstraction,
  PinService,
  PinServiceAbstraction,
  UserDecryptionOptionsService,
} from "@bitwarden/auth/common";
import { EventCollectionService as EventCollectionServiceAbstraction } from "@bitwarden/common/abstractions/event/event-collection.service";
import { EventUploadService as EventUploadServiceAbstraction } from "@bitwarden/common/abstractions/event/event-upload.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { ProviderApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/provider/provider-api.service.abstraction";
import { OrganizationApiService } from "@bitwarden/common/admin-console/services/organization/organization-api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/services/organization/organization.service";
import { PolicyApiService } from "@bitwarden/common/admin-console/services/policy/policy-api.service";
import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { ProviderApiService } from "@bitwarden/common/admin-console/services/provider/provider-api.service";
import { ProviderService } from "@bitwarden/common/admin-console/services/provider.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AvatarService as AvatarServiceAbstraction } from "@bitwarden/common/auth/abstractions/avatar.service";
import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { DevicesApiServiceAbstraction } from "@bitwarden/common/auth/abstractions/devices-api.service.abstraction";
import { KdfConfigService as KdfConfigServiceAbstraction } from "@bitwarden/common/auth/abstractions/kdf-config.service";
import { InternalMasterPasswordServiceAbstraction } from "@bitwarden/common/auth/abstractions/master-password.service.abstraction";
import { AccountServiceImplementation } from "@bitwarden/common/auth/services/account.service";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";
import { AvatarService } from "@bitwarden/common/auth/services/avatar.service";
import { DeviceTrustService } from "@bitwarden/common/auth/services/device-trust.service.implementation";
import { DevicesApiServiceImplementation } from "@bitwarden/common/auth/services/devices-api.service.implementation";
import { KdfConfigService } from "@bitwarden/common/auth/services/kdf-config.service";
import { KeyConnectorService } from "@bitwarden/common/auth/services/key-connector.service";
import { MasterPasswordService } from "@bitwarden/common/auth/services/master-password/master-password.service";
import { TokenService } from "@bitwarden/common/auth/services/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/services/two-factor.service";
import { UserVerificationApiService } from "@bitwarden/common/auth/services/user-verification/user-verification-api.service";
import { UserVerificationService } from "@bitwarden/common/auth/services/user-verification/user-verification.service";
import {
  AutofillSettingsService,
  AutofillSettingsServiceAbstraction,
} from "@bitwarden/common/autofill/services/autofill-settings.service";
import {
  DefaultDomainSettingsService,
  DomainSettingsService,
} from "@bitwarden/common/autofill/services/domain-settings.service";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { DefaultBillingAccountProfileStateService } from "@bitwarden/common/billing/services/account/billing-account-profile-state.service";
import { ClientType } from "@bitwarden/common/enums";
import { ConfigApiServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config-api.service.abstraction";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import {
  EnvironmentService,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { KeyGenerationService as KeyGenerationServiceAbstraction } from "@bitwarden/common/platform/abstractions/key-generation.service";
import { SdkService } from "@bitwarden/common/platform/abstractions/sdk/sdk.service";
import { KeySuffixOptions, LogLevelType } from "@bitwarden/common/platform/enums";
import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";
import { MessageSender } from "@bitwarden/common/platform/messaging";
import { Account } from "@bitwarden/common/platform/models/domain/account";
import { GlobalState } from "@bitwarden/common/platform/models/domain/global-state";
import {
  TaskSchedulerService,
  DefaultTaskSchedulerService,
} from "@bitwarden/common/platform/scheduling";
import { AppIdService } from "@bitwarden/common/platform/services/app-id.service";
import { ConfigApiService } from "@bitwarden/common/platform/services/config/config-api.service";
import { DefaultConfigService } from "@bitwarden/common/platform/services/config/default-config.service";
import { ContainerService } from "@bitwarden/common/platform/services/container.service";
import { EncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/encrypt.service.implementation";
import { FallbackBulkEncryptService } from "@bitwarden/common/platform/services/cryptography/fallback-bulk-encrypt.service";
import { DefaultEnvironmentService } from "@bitwarden/common/platform/services/default-environment.service";
import { FileUploadService } from "@bitwarden/common/platform/services/file-upload/file-upload.service";
import { KeyGenerationService } from "@bitwarden/common/platform/services/key-generation.service";
import { MemoryStorageService } from "@bitwarden/common/platform/services/memory-storage.service";
import { MigrationBuilderService } from "@bitwarden/common/platform/services/migration-builder.service";
import { MigrationRunner } from "@bitwarden/common/platform/services/migration-runner";
import { DefaultSdkClientFactory } from "@bitwarden/common/platform/services/sdk/default-sdk-client-factory";
import { DefaultSdkService } from "@bitwarden/common/platform/services/sdk/default-sdk.service";
import { NoopSdkClientFactory } from "@bitwarden/common/platform/services/sdk/noop-sdk-client-factory";
import { StateService } from "@bitwarden/common/platform/services/state.service";
import { StorageServiceProvider } from "@bitwarden/common/platform/services/storage-service.provider";
import { UserAutoUnlockKeyService } from "@bitwarden/common/platform/services/user-auto-unlock-key.service";
import {
  ActiveUserStateProvider,
  DerivedStateProvider,
  GlobalStateProvider,
  SingleUserStateProvider,
  StateEventRunnerService,
  StateProvider,
} from "@bitwarden/common/platform/state";
/* eslint-disable import/no-restricted-paths -- We need the implementation to inject, but generally these should not be accessed */
import { DefaultActiveUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-active-user-state.provider";
import { DefaultDerivedStateProvider } from "@bitwarden/common/platform/state/implementations/default-derived-state.provider";
import { DefaultGlobalStateProvider } from "@bitwarden/common/platform/state/implementations/default-global-state.provider";
import { DefaultSingleUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-single-user-state.provider";
import { DefaultStateProvider } from "@bitwarden/common/platform/state/implementations/default-state.provider";
import { StateEventRegistrarService } from "@bitwarden/common/platform/state/state-event-registrar.service";
import { MemoryStorageService as MemoryStorageServiceForStateProviders } from "@bitwarden/common/platform/state/storage/memory-storage.service";
/* eslint-enable import/no-restricted-paths */
import { SyncService } from "@bitwarden/common/platform/sync";
// eslint-disable-next-line no-restricted-imports -- Needed for service construction
import { DefaultSyncService } from "@bitwarden/common/platform/sync/internal";
import { AuditService } from "@bitwarden/common/services/audit.service";
import { EventCollectionService } from "@bitwarden/common/services/event/event-collection.service";
import { EventUploadService } from "@bitwarden/common/services/event/event-upload.service";
import { SearchService } from "@bitwarden/common/services/search.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/services/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutService } from "@bitwarden/common/services/vault-timeout/vault-timeout.service";
import {
  PasswordStrengthService,
  PasswordStrengthServiceAbstraction,
} from "@bitwarden/common/tools/password-strength";
import { SendApiService } from "@bitwarden/common/tools/send/services/send-api.service";
import { SendStateProvider } from "@bitwarden/common/tools/send/services/send-state.provider";
import { SendService } from "@bitwarden/common/tools/send/services/send.service";
import { UserId } from "@bitwarden/common/types/guid";
import { VaultTimeoutStringType } from "@bitwarden/common/types/vault-timeout.type";
import { InternalFolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import {
  CipherAuthorizationService,
  DefaultCipherAuthorizationService,
} from "@bitwarden/common/vault/services/cipher-authorization.service";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { CipherFileUploadService } from "@bitwarden/common/vault/services/file-upload/cipher-file-upload.service";
import { FolderApiService } from "@bitwarden/common/vault/services/folder/folder-api.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";
import { TotpService } from "@bitwarden/common/vault/services/totp.service";
import {
  legacyPasswordGenerationServiceFactory,
  PasswordGenerationServiceAbstraction,
} from "@bitwarden/generator-legacy";
import {
  ImportApiService,
  ImportApiServiceAbstraction,
  ImportService,
  ImportServiceAbstraction,
} from "@bitwarden/importer/core";
import {
  DefaultKeyService as KeyService,
  BiometricStateService,
  DefaultBiometricStateService,
} from "@bitwarden/key-management";
import { NodeCryptoFunctionService } from "@bitwarden/node/services/node-crypto-function.service";
import {
  IndividualVaultExportService,
  IndividualVaultExportServiceAbstraction,
  OrganizationVaultExportService,
  OrganizationVaultExportServiceAbstraction,
  VaultExportService,
  VaultExportServiceAbstraction,
} from "@bitwarden/vault-export-core";

import { flagEnabled } from "../platform/flags";
import { CliPlatformUtilsService } from "../platform/services/cli-platform-utils.service";
import { ConsoleLogService } from "../platform/services/console-log.service";
import { CliI18nService } from "../platform/services/i18n.service";
import { LowdbStorageService } from "../platform/services/lowdb-storage.service";
import { NodeApiService } from "../platform/services/node-api.service";
import { NodeEnvSecureStorageService } from "../platform/services/node-env-secure-storage.service";

// Polyfills
global.DOMParser = new jsdom.JSDOM().window.DOMParser;

// eslint-disable-next-line
const packageJson = require("../../package.json");

/**
 * Instantiates services and makes them available for dependency injection.
 * Any Bitwarden-licensed services should be registered here.
 */
export class ServiceContainer {
  private inited = false;

  messagingService: MessageSender;
  storageService: LowdbStorageService;
  secureStorageService: NodeEnvSecureStorageService;
  memoryStorageService: MemoryStorageService;
  memoryStorageForStateProviders: MemoryStorageServiceForStateProviders;
  i18nService: CliI18nService;
  platformUtilsService: CliPlatformUtilsService;
  keyService: KeyService;
  tokenService: TokenService;
  appIdService: AppIdService;
  apiService: NodeApiService;
  environmentService: EnvironmentService;
  cipherService: CipherService;
  folderService: InternalFolderService;
  organizationUserApiService: OrganizationUserApiService;
  collectionService: DefaultCollectionService;
  vaultTimeoutService: VaultTimeoutService;
  masterPasswordService: InternalMasterPasswordServiceAbstraction;
  vaultTimeoutSettingsService: VaultTimeoutSettingsService;
  syncService: SyncService;
  eventCollectionService: EventCollectionServiceAbstraction;
  eventUploadService: EventUploadServiceAbstraction;
  passwordGenerationService: PasswordGenerationServiceAbstraction;
  passwordStrengthService: PasswordStrengthServiceAbstraction;
  userDecryptionOptionsService: InternalUserDecryptionOptionsServiceAbstraction;
  totpService: TotpService;
  containerService: ContainerService;
  auditService: AuditService;
  importService: ImportServiceAbstraction;
  importApiService: ImportApiServiceAbstraction;
  exportService: VaultExportServiceAbstraction;
  individualExportService: IndividualVaultExportServiceAbstraction;
  organizationExportService: OrganizationVaultExportServiceAbstraction;
  searchService: SearchService;
  keyGenerationService: KeyGenerationServiceAbstraction;
  cryptoFunctionService: NodeCryptoFunctionService;
  encryptService: EncryptServiceImplementation;
  authService: AuthService;
  policyService: PolicyService;
  policyApiService: PolicyApiServiceAbstraction;
  logService: ConsoleLogService;
  sendService: SendService;
  sendStateProvider: SendStateProvider;
  fileUploadService: FileUploadService;
  cipherFileUploadService: CipherFileUploadService;
  keyConnectorService: KeyConnectorService;
  userVerificationService: UserVerificationService;
  pinService: PinServiceAbstraction;
  stateService: StateService;
  autofillSettingsService: AutofillSettingsServiceAbstraction;
  domainSettingsService: DomainSettingsService;
  organizationService: OrganizationService;
  providerService: ProviderService;
  twoFactorService: TwoFactorService;
  folderApiService: FolderApiService;
  userVerificationApiService: UserVerificationApiService;
  organizationApiService: OrganizationApiServiceAbstraction;
  sendApiService: SendApiService;
  devicesApiService: DevicesApiServiceAbstraction;
  deviceTrustService: DeviceTrustServiceAbstraction;
  authRequestService: AuthRequestService;
  configApiService: ConfigApiServiceAbstraction;
  configService: ConfigService;
  accountService: AccountService;
  globalStateProvider: GlobalStateProvider;
  singleUserStateProvider: SingleUserStateProvider;
  activeUserStateProvider: ActiveUserStateProvider;
  derivedStateProvider: DerivedStateProvider;
  stateProvider: StateProvider;
  loginStrategyService: LoginStrategyServiceAbstraction;
  avatarService: AvatarServiceAbstraction;
  stateEventRunnerService: StateEventRunnerService;
  biometricStateService: BiometricStateService;
  billingAccountProfileStateService: BillingAccountProfileStateService;
  providerApiService: ProviderApiServiceAbstraction;
  userAutoUnlockKeyService: UserAutoUnlockKeyService;
  kdfConfigService: KdfConfigServiceAbstraction;
  taskSchedulerService: TaskSchedulerService;
  sdkService: SdkService;
  cipherAuthorizationService: CipherAuthorizationService;

  constructor() {
    let p = null;
    const relativeDataDir = path.join(path.dirname(process.execPath), "bw-data");
    if (fs.existsSync(relativeDataDir)) {
      p = relativeDataDir;
    } else if (process.env.BITWARDENCLI_APPDATA_DIR) {
      p = path.resolve(process.env.BITWARDENCLI_APPDATA_DIR);
    } else if (process.platform === "darwin") {
      p = path.join(process.env.HOME ?? "", "Library/Application Support/Bitwarden CLI");
    } else if (process.platform === "win32") {
      p = path.join(process.env.APPDATA ?? "", "Bitwarden CLI");
    } else if (process.env.XDG_CONFIG_HOME) {
      p = path.join(process.env.XDG_CONFIG_HOME, "Bitwarden CLI");
    } else {
      p = path.join(process.env.HOME ?? "", ".config/Bitwarden CLI");
    }

    const logoutCallback = async () => await this.logout();

    this.platformUtilsService = new CliPlatformUtilsService(ClientType.Cli, packageJson);
    this.logService = new ConsoleLogService(
      this.platformUtilsService.isDev(),
      (level) => process.env.BITWARDENCLI_DEBUG !== "true" && level <= LogLevelType.Info,
    );
    this.cryptoFunctionService = new NodeCryptoFunctionService();
    this.encryptService = new EncryptServiceImplementation(
      this.cryptoFunctionService,
      this.logService,
      true,
    );
    this.storageService = new LowdbStorageService(this.logService, null, p, false, true);
    this.secureStorageService = new NodeEnvSecureStorageService(
      this.storageService,
      this.logService,
      // MAC failures for secure storage are being logged for customers today and
      // they occur when users unlock / login and refresh a session key but don't
      // export it into their environment (e.g. BW_SESSION_KEY). This leaves a stale
      // BW_SESSION key in the env which is attempted to be used to decrypt the auto
      // unlock user key which obviously fails. So, to resolve this, we will not log
      // MAC failures for secure storage.
      new EncryptServiceImplementation(this.cryptoFunctionService, this.logService, false),
    );

    this.memoryStorageService = new MemoryStorageService();
    this.memoryStorageForStateProviders = new MemoryStorageServiceForStateProviders();

    const storageServiceProvider = new StorageServiceProvider(
      this.storageService,
      this.memoryStorageForStateProviders,
    );

    this.globalStateProvider = new DefaultGlobalStateProvider(
      storageServiceProvider,
      this.logService,
    );

    const stateEventRegistrarService = new StateEventRegistrarService(
      this.globalStateProvider,
      storageServiceProvider,
    );

    this.stateEventRunnerService = new StateEventRunnerService(
      this.globalStateProvider,
      storageServiceProvider,
    );

    this.i18nService = new CliI18nService("en", "./locales", this.globalStateProvider);

    this.singleUserStateProvider = new DefaultSingleUserStateProvider(
      storageServiceProvider,
      stateEventRegistrarService,
      this.logService,
    );

    this.messagingService = MessageSender.EMPTY;

    this.accountService = new AccountServiceImplementation(
      this.messagingService,
      this.logService,
      this.globalStateProvider,
    );

    this.activeUserStateProvider = new DefaultActiveUserStateProvider(
      this.accountService,
      this.singleUserStateProvider,
    );

    this.derivedStateProvider = new DefaultDerivedStateProvider();

    this.stateProvider = new DefaultStateProvider(
      this.activeUserStateProvider,
      this.singleUserStateProvider,
      this.globalStateProvider,
      this.derivedStateProvider,
    );

    this.environmentService = new DefaultEnvironmentService(
      this.stateProvider,
      this.accountService,
      process.env.ADDITIONAL_REGIONS as unknown as RegionConfig[],
    );

    this.keyGenerationService = new KeyGenerationService(this.cryptoFunctionService);

    this.tokenService = new TokenService(
      this.singleUserStateProvider,
      this.globalStateProvider,
      this.platformUtilsService.supportsSecureStorage(),
      this.secureStorageService,
      this.keyGenerationService,
      this.encryptService,
      this.logService,
      logoutCallback,
    );

    const migrationRunner = new MigrationRunner(
      this.storageService,
      this.logService,
      new MigrationBuilderService(),
      ClientType.Cli,
    );

    this.stateService = new StateService(
      this.storageService,
      this.secureStorageService,
      this.memoryStorageService,
      this.logService,
      new StateFactory(GlobalState, Account),
      this.accountService,
      this.environmentService,
      this.tokenService,
      migrationRunner,
    );

    this.masterPasswordService = new MasterPasswordService(
      this.stateProvider,
      this.stateService,
      this.keyGenerationService,
      this.encryptService,
      this.logService,
    );

    this.kdfConfigService = new KdfConfigService(this.stateProvider);

    this.pinService = new PinService(
      this.accountService,
      this.cryptoFunctionService,
      this.encryptService,
      this.kdfConfigService,
      this.keyGenerationService,
      this.logService,
      this.masterPasswordService,
      this.stateProvider,
      this.stateService,
    );

    this.keyService = new KeyService(
      this.pinService,
      this.masterPasswordService,
      this.keyGenerationService,
      this.cryptoFunctionService,
      this.encryptService,
      this.platformUtilsService,
      this.logService,
      this.stateService,
      this.accountService,
      this.stateProvider,
      this.kdfConfigService,
    );

    this.appIdService = new AppIdService(this.storageService, this.logService);

    const customUserAgent =
      "Bitwarden_CLI/" +
      this.platformUtilsService.getApplicationVersionSync() +
      " (" +
      this.platformUtilsService.getDeviceString().toUpperCase() +
      ")";

    this.biometricStateService = new DefaultBiometricStateService(this.stateProvider);
    this.userDecryptionOptionsService = new UserDecryptionOptionsService(this.stateProvider);

    this.organizationService = new OrganizationService(this.stateProvider);
    this.policyService = new PolicyService(this.stateProvider, this.organizationService);

    this.vaultTimeoutSettingsService = new VaultTimeoutSettingsService(
      this.accountService,
      this.pinService,
      this.userDecryptionOptionsService,
      this.keyService,
      this.tokenService,
      this.policyService,
      this.biometricStateService,
      this.stateProvider,
      this.logService,
      VaultTimeoutStringType.Never, // default vault timeout
    );

    const refreshAccessTokenErrorCallback = () => {
      throw new Error("Refresh Access token error");
    };

    this.apiService = new NodeApiService(
      this.tokenService,
      this.platformUtilsService,
      this.environmentService,
      this.appIdService,
      refreshAccessTokenErrorCallback,
      this.logService,
      logoutCallback,
      this.vaultTimeoutSettingsService,
      customUserAgent,
    );

    this.containerService = new ContainerService(this.keyService, this.encryptService);

    this.domainSettingsService = new DefaultDomainSettingsService(this.stateProvider);

    this.fileUploadService = new FileUploadService(this.logService);

    this.sendStateProvider = new SendStateProvider(this.stateProvider);

    this.sendService = new SendService(
      this.keyService,
      this.i18nService,
      this.keyGenerationService,
      this.sendStateProvider,
      this.encryptService,
    );

    this.cipherFileUploadService = new CipherFileUploadService(
      this.apiService,
      this.fileUploadService,
    );

    this.sendApiService = this.sendApiService = new SendApiService(
      this.apiService,
      this.fileUploadService,
      this.sendService,
    );

    this.searchService = new SearchService(this.logService, this.i18nService, this.stateProvider);

    this.collectionService = new DefaultCollectionService(
      this.keyService,
      this.encryptService,
      this.i18nService,
      this.stateProvider,
    );

    this.providerService = new ProviderService(this.stateProvider);

    this.policyApiService = new PolicyApiService(this.policyService, this.apiService);

    this.keyConnectorService = new KeyConnectorService(
      this.accountService,
      this.masterPasswordService,
      this.keyService,
      this.apiService,
      this.tokenService,
      this.logService,
      this.organizationService,
      this.keyGenerationService,
      logoutCallback,
      this.stateProvider,
    );

    this.twoFactorService = new TwoFactorService(
      this.i18nService,
      this.platformUtilsService,
      this.globalStateProvider,
    );

    const sdkClientFactory = flagEnabled("sdk")
      ? new DefaultSdkClientFactory()
      : new NoopSdkClientFactory();
    this.sdkService = new DefaultSdkService(
      sdkClientFactory,
      this.environmentService,
      this.platformUtilsService,
      this.accountService,
      this.kdfConfigService,
      this.keyService,
      this.apiService,
      customUserAgent,
    );

    this.passwordStrengthService = new PasswordStrengthService();

    this.passwordGenerationService = legacyPasswordGenerationServiceFactory(
      this.encryptService,
      this.keyService,
      this.policyService,
      this.accountService,
      this.stateProvider,
    );

    this.authRequestService = new AuthRequestService(
      this.appIdService,
      this.accountService,
      this.masterPasswordService,
      this.keyService,
      this.encryptService,
      this.apiService,
      this.stateProvider,
    );

    this.billingAccountProfileStateService = new DefaultBillingAccountProfileStateService(
      this.stateProvider,
    );

    this.taskSchedulerService = new DefaultTaskSchedulerService(this.logService);

    this.authService = new AuthService(
      this.accountService,
      this.messagingService,
      this.keyService,
      this.apiService,
      this.stateService,
      this.tokenService,
    );

    this.configApiService = new ConfigApiService(this.apiService, this.tokenService);

    this.configService = new DefaultConfigService(
      this.configApiService,
      this.environmentService,
      this.logService,
      this.stateProvider,
      this.authService,
    );

    this.devicesApiService = new DevicesApiServiceImplementation(this.apiService);
    this.deviceTrustService = new DeviceTrustService(
      this.keyGenerationService,
      this.cryptoFunctionService,
      this.keyService,
      this.encryptService,
      this.appIdService,
      this.devicesApiService,
      this.i18nService,
      this.platformUtilsService,
      this.stateProvider,
      this.secureStorageService,
      this.userDecryptionOptionsService,
      this.logService,
      this.configService,
    );

    this.loginStrategyService = new LoginStrategyService(
      this.accountService,
      this.masterPasswordService,
      this.keyService,
      this.apiService,
      this.tokenService,
      this.appIdService,
      this.platformUtilsService,
      this.messagingService,
      this.logService,
      this.keyConnectorService,
      this.environmentService,
      this.stateService,
      this.twoFactorService,
      this.i18nService,
      this.encryptService,
      this.passwordStrengthService,
      this.policyService,
      this.deviceTrustService,
      this.authRequestService,
      this.userDecryptionOptionsService,
      this.globalStateProvider,
      this.billingAccountProfileStateService,
      this.vaultTimeoutSettingsService,
      this.kdfConfigService,
      this.taskSchedulerService,
    );

    // FIXME: CLI does not support autofill
    this.autofillSettingsService = new AutofillSettingsService(
      this.stateProvider,
      this.policyService,
    );

    this.cipherService = new CipherService(
      this.keyService,
      this.domainSettingsService,
      this.apiService,
      this.i18nService,
      this.searchService,
      this.stateService,
      this.autofillSettingsService,
      this.encryptService,
      new FallbackBulkEncryptService(this.encryptService),
      this.cipherFileUploadService,
      this.configService,
      this.stateProvider,
      this.accountService,
    );

    this.folderService = new FolderService(
      this.keyService,
      this.encryptService,
      this.i18nService,
      this.cipherService,
      this.stateProvider,
    );

    this.folderApiService = new FolderApiService(this.folderService, this.apiService);

    const lockedCallback = async (userId?: string) =>
      await this.keyService.clearStoredUserKey(KeySuffixOptions.Auto);

    this.userVerificationApiService = new UserVerificationApiService(this.apiService);

    this.userVerificationService = new UserVerificationService(
      this.keyService,
      this.accountService,
      this.masterPasswordService,
      this.i18nService,
      this.userVerificationApiService,
      this.userDecryptionOptionsService,
      this.pinService,
      this.logService,
      this.vaultTimeoutSettingsService,
      this.platformUtilsService,
      this.kdfConfigService,
    );

    this.vaultTimeoutService = new VaultTimeoutService(
      this.accountService,
      this.masterPasswordService,
      this.cipherService,
      this.folderService,
      this.collectionService,
      this.platformUtilsService,
      this.messagingService,
      this.searchService,
      this.stateService,
      this.authService,
      this.vaultTimeoutSettingsService,
      this.stateEventRunnerService,
      this.taskSchedulerService,
      this.logService,
      lockedCallback,
      undefined,
    );

    this.avatarService = new AvatarService(this.apiService, this.stateProvider);

    this.syncService = new DefaultSyncService(
      this.masterPasswordService,
      this.accountService,
      this.apiService,
      this.domainSettingsService,
      this.folderService,
      this.cipherService,
      this.keyService,
      this.collectionService,
      this.messagingService,
      this.policyService,
      this.sendService,
      this.logService,
      this.keyConnectorService,
      this.stateService,
      this.providerService,
      this.folderApiService,
      this.organizationService,
      this.sendApiService,
      this.userDecryptionOptionsService,
      this.avatarService,
      logoutCallback,
      this.billingAccountProfileStateService,
      this.tokenService,
      this.authService,
      this.stateProvider,
    );

    this.totpService = new TotpService(this.cryptoFunctionService, this.logService);

    this.importApiService = new ImportApiService(this.apiService);

    this.importService = new ImportService(
      this.cipherService,
      this.folderService,
      this.importApiService,
      this.i18nService,
      this.collectionService,
      this.keyService,
      this.encryptService,
      this.pinService,
      this.accountService,
    );

    this.individualExportService = new IndividualVaultExportService(
      this.folderService,
      this.cipherService,
      this.pinService,
      this.keyService,
      this.encryptService,
      this.cryptoFunctionService,
      this.kdfConfigService,
      this.accountService,
    );

    this.organizationExportService = new OrganizationVaultExportService(
      this.cipherService,
      this.apiService,
      this.pinService,
      this.keyService,
      this.encryptService,
      this.cryptoFunctionService,
      this.collectionService,
      this.kdfConfigService,
      this.accountService,
    );

    this.exportService = new VaultExportService(
      this.individualExportService,
      this.organizationExportService,
    );

    this.userAutoUnlockKeyService = new UserAutoUnlockKeyService(this.keyService);

    this.auditService = new AuditService(this.cryptoFunctionService, this.apiService);

    this.eventUploadService = new EventUploadService(
      this.apiService,
      this.stateProvider,
      this.logService,
      this.authService,
      this.taskSchedulerService,
    );

    this.eventCollectionService = new EventCollectionService(
      this.cipherService,
      this.stateProvider,
      this.organizationService,
      this.eventUploadService,
      this.authService,
      this.accountService,
    );

    this.organizationApiService = new OrganizationApiService(this.apiService, this.syncService);

    this.providerApiService = new ProviderApiService(this.apiService);

    this.organizationUserApiService = new DefaultOrganizationUserApiService(this.apiService);

    this.cipherAuthorizationService = new DefaultCipherAuthorizationService(
      this.collectionService,
      this.organizationService,
    );
  }

  async logout() {
    this.authService.logOut(() => {
      /* Do nothing */
    });
    const userId = await firstValueFrom(this.accountService.activeAccount$.pipe(map((a) => a?.id)));
    await Promise.all([
      this.eventUploadService.uploadEvents(userId as UserId),
      this.keyService.clearKeys(),
      this.cipherService.clear(userId),
      this.folderService.clear(userId),
      this.collectionService.clear(userId),
    ]);

    await this.stateEventRunnerService.handleEvent("logout", userId as UserId);

    await this.stateService.clean();
    await this.accountService.clean(userId as UserId);
    await this.accountService.switchAccount(null);
    process.env.BW_SESSION = undefined;
  }

  async init() {
    if (this.inited) {
      this.logService.warning("ServiceContainer.init called more than once");
      return;
    }

    await this.storageService.init();
    await this.stateService.init();
    this.containerService.attachToGlobal(global);
    await this.i18nService.init();
    this.twoFactorService.init();

    // If a user has a BW_SESSION key stored in their env (not process.env.BW_SESSION),
    // this should set the user key to unlock the vault on init.
    // TODO: ideally, we wouldn't want to do this here but instead only for commands that require the vault to be unlocked
    // as this runs on every command and could be a performance hit
    const activeAccount = await firstValueFrom(this.accountService.activeAccount$);
    if (activeAccount?.id) {
      await this.userAutoUnlockKeyService.setUserKeyInMemoryIfAutoUserKeySet(activeAccount.id);
    }

    this.inited = true;

    if (flagEnabled("sdk")) {
      // Warn if the SDK for some reason can't be initialized
      let supported = false;
      try {
        supported = await firstValueFrom(this.sdkService.supported$);
      } catch (e) {
        // Do nothing.
      }

      if (!supported) {
        this.sdkService.failedToInitialize("cli").catch((e) => this.logService.error(e));
      }
    }
  }
}
