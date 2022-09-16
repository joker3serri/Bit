import { Jsonify } from "type-fest";

import { Utils } from "@bitwarden/common/misc/utils";

import { AuthenticationStatus } from "../../enums/authenticationStatus";
import { KdfType } from "../../enums/kdfType";
import { UriMatchType } from "../../enums/uriMatchType";
import { CipherData } from "../data/cipherData";
import { CollectionData } from "../data/collectionData";
import { EncryptedOrganizationKeyData } from "../data/encryptedOrganizationKeyData";
import { EventData } from "../data/eventData";
import { FolderData } from "../data/folderData";
import { OrganizationData } from "../data/organizationData";
import { PolicyData } from "../data/policyData";
import { ProviderData } from "../data/providerData";
import { SendData } from "../data/sendData";
import { CipherView } from "../view/cipherView";
import { CollectionView } from "../view/collectionView";
import { SendView } from "../view/sendView";

import { EncString } from "./encString";
import { EnvironmentUrls } from "./environmentUrls";
import { GeneratedPasswordHistory } from "./generatedPasswordHistory";
import { Policy } from "./policy";
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

export class EncryptionPair<TEncrypted, TDecrypted> {
  encrypted?: TEncrypted;
  decrypted?: TDecrypted;
  private decryptedSerialized?: string;

  toJSON() {
    return {
      encrypted: this.encrypted,
      decrypted: this.decrypted,
      decryptedSerialized:
        this.decrypted instanceof ArrayBuffer ? Utils.fromBufferToByteString(this.decrypted) : null,
    };
  }

  static fromJSON<TEncrypted, TDecrypted>(
    obj: Jsonify<EncryptionPair<Jsonify<TEncrypted>, Jsonify<TDecrypted>>>,
    decryptedFromJson?: (decObj: Jsonify<TDecrypted>) => TDecrypted,
    encryptedFromJson?: (encObj: Jsonify<TEncrypted>) => TEncrypted
  ) {
    const pair = new EncryptionPair<TEncrypted, TDecrypted>();
    if (obj?.encrypted != null) {
      pair.encrypted = encryptedFromJson
        ? encryptedFromJson(obj.encrypted)
        : (obj.encrypted as TEncrypted);
    }
    if (obj?.decryptedSerialized != null) {
      pair.decryptedSerialized = obj.decryptedSerialized;
      // We only populate the decryptedSerialized if the decrypted is an arraybuffer.
      pair.decrypted = Utils.fromByteStringToArray(obj.decryptedSerialized)?.buffer as any;
    } else if (obj?.decrypted != null) {
      pair.decrypted = decryptedFromJson
        ? decryptedFromJson(obj.decrypted)
        : (obj.decrypted as TDecrypted);
    }
    return pair;
  }
}

export class DataEncryptionPair<TEncrypted, TDecrypted> {
  encrypted?: { [id: string]: TEncrypted };
  decrypted?: TDecrypted[];
}

// This is a temporary structure to handle migrated `DataEncryptionPair` to
//  avoid needing a data migration at this stage. It should be replaced with
//  proper data migrations when `DataEncryptionPair` is deprecated.
export class TemporaryDataEncryption<TEncrypted> {
  encrypted?: { [id: string]: TEncrypted };
}

export class AccountData {
  ciphers?: DataEncryptionPair<CipherData, CipherView> = new DataEncryptionPair<
    CipherData,
    CipherView
  >();
  folders? = new TemporaryDataEncryption<FolderData>();
  localData?: any;
  sends?: DataEncryptionPair<SendData, SendView> = new DataEncryptionPair<SendData, SendView>();
  collections?: DataEncryptionPair<CollectionData, CollectionView> = new DataEncryptionPair<
    CollectionData,
    CollectionView
  >();
  policies?: DataEncryptionPair<PolicyData, Policy> = new DataEncryptionPair<PolicyData, Policy>();
  passwordGenerationHistory?: EncryptionPair<
    GeneratedPasswordHistory[],
    GeneratedPasswordHistory[]
  > = new EncryptionPair<GeneratedPasswordHistory[], GeneratedPasswordHistory[]>();
  addEditCipherInfo?: any;
  eventCollection?: EventData[];
  organizations?: { [id: string]: OrganizationData };
  providers?: { [id: string]: ProviderData };
}

export class AccountKeys {
  cryptoMasterKey?: SymmetricCryptoKey;
  cryptoMasterKeyAuto?: string;
  cryptoMasterKeyB64?: string;
  cryptoMasterKeyBiometric?: string;
  cryptoSymmetricKey?: EncryptionPair<string, SymmetricCryptoKey> = new EncryptionPair<
    string,
    SymmetricCryptoKey
  >();
  organizationKeys?: EncryptionPair<
    { [orgId: string]: EncryptedOrganizationKeyData },
    Record<string, SymmetricCryptoKey>
  > = new EncryptionPair<
    { [orgId: string]: EncryptedOrganizationKeyData },
    Record<string, SymmetricCryptoKey>
  >();
  providerKeys?: EncryptionPair<Record<string, string>, Record<string, SymmetricCryptoKey>> =
    new EncryptionPair<Record<string, string>, Record<string, SymmetricCryptoKey>>();
  privateKey?: EncryptionPair<string, ArrayBuffer> = new EncryptionPair<string, ArrayBuffer>();
  publicKey?: ArrayBuffer;
  private publicKeySerialized?: string;
  apiKeyClientSecret?: string;

  toJSON() {
    this.publicKeySerialized = Utils.fromBufferToByteString(this.publicKey);
    // This return is a bit of a hack to force Jsonify to recognize the type of the object.
    // Jsonify refuses to execute recursively on `toJSON` methods, instead expecting the return to extend JsonValue.
    return {
      cryptoMasterKey: this.cryptoMasterKey?.toJSON(),
      cryptoMasterKeyAuto: this.cryptoMasterKeyAuto,
      cryptoMasterKeyB64: this.cryptoMasterKeyB64,
      cryptoMasterKeyBiometric: this.cryptoMasterKeyBiometric,
      cryptoSymmetricKey: this.cryptoSymmetricKey?.toJSON() as {
        encrypted: string;
        decrypted: Jsonify<SymmetricCryptoKey>;
        decryptedSerialized: string;
      },
      organizationKeys: this.organizationKeys?.toJSON() as {
        encrypted: { [orgId: string]: EncryptedOrganizationKeyData };
        decrypted: Record<string, Jsonify<SymmetricCryptoKey>>;
        decryptedSerialized: string;
      },
      providerKeys: this.providerKeys?.toJSON() as {
        encrypted: Record<string, string>;
        decrypted: Record<string, Jsonify<SymmetricCryptoKey>>;
        decryptedSerialized: string;
      },
      privateKey: this.privateKey?.toJSON() as {
        encrypted: string;
        decrypted: Jsonify<ArrayBuffer>;
        decryptedSerialized: string;
      },
      publicKeySerialized: this.publicKeySerialized,
    };
  }

  static fromJSON(obj: Partial<Jsonify<AccountKeys>>): AccountKeys {
    return Object.assign(
      new AccountKeys(),
      { cryptoMasterKey: SymmetricCryptoKey.fromJSON(obj?.cryptoMasterKey) },
      {
        cryptoSymmetricKey: EncryptionPair.fromJSON(
          obj?.cryptoSymmetricKey,
          SymmetricCryptoKey.fromJSON
        ),
      },
      { organizationKeys: AccountKeys.initRecordEncryptionPairsFromJSON(obj?.organizationKeys) },
      { providerKeys: AccountKeys.initRecordEncryptionPairsFromJSON(obj?.providerKeys) },
      { privateKey: EncryptionPair.fromJSON(obj?.privateKey) },
      {
        publicKey: Utils.fromByteStringToArray(obj?.publicKeySerialized)?.buffer,
      }
    );
  }

  // These `any` types are a result of Jsonify<T> not being recursive on toJSON methods.
  static initRecordEncryptionPairsFromJSON(obj: any) {
    return EncryptionPair.fromJSON(obj, (decObj: any) => {
      const record: Record<string, SymmetricCryptoKey> = {};
      for (const key in decObj) {
        record[key] = SymmetricCryptoKey.fromJSON(decObj[key]);
      }
      return record;
    });
  }
}

export class AccountProfile {
  apiKeyClientId?: string;
  authenticationStatus?: AuthenticationStatus;
  convertAccountToKeyConnector?: boolean;
  email?: string;
  emailVerified?: boolean;
  entityId?: string;
  entityType?: string;
  everBeenUnlocked?: boolean;
  forcePasswordReset?: boolean;
  hasPremiumPersonally?: boolean;
  hasPremiumFromOrganization?: boolean;
  lastSync?: string;
  userId?: string;
  usesKeyConnector?: boolean;
  keyHash?: string;
  kdfIterations?: number;
  kdfType?: KdfType;

  static fromJSON(obj: Jsonify<AccountProfile>): AccountProfile {
    return Object.assign(new AccountProfile(), obj);
  }
}

export class AccountSettings {
  autoConfirmFingerPrints?: boolean;
  autoFillOnPageLoadDefault?: boolean;
  biometricUnlock?: boolean;
  clearClipboard?: number;
  collapsedGroupings?: string[];
  defaultUriMatch?: UriMatchType;
  disableAddLoginNotification?: boolean;
  disableAutoBiometricsPrompt?: boolean;
  disableAutoTotpCopy?: boolean;
  disableBadgeCounter?: boolean;
  disableChangedPasswordNotification?: boolean;
  disableContextMenuItem?: boolean;
  disableGa?: boolean;
  dontShowCardsCurrentTab?: boolean;
  dontShowIdentitiesCurrentTab?: boolean;
  enableAlwaysOnTop?: boolean;
  enableAutoFillOnPageLoad?: boolean;
  enableBiometric?: boolean;
  enableFullWidth?: boolean;
  enableGravitars?: boolean;
  environmentUrls: EnvironmentUrls = new EnvironmentUrls();
  equivalentDomains?: any;
  minimizeOnCopyToClipboard?: boolean;
  neverDomains?: { [id: string]: any };
  passwordGenerationOptions?: any;
  usernameGenerationOptions?: any;
  generatorOptions?: any;
  pinProtected?: EncryptionPair<string, EncString> = new EncryptionPair<string, EncString>();
  protectedPin?: string;
  settings?: AccountSettingsSettings; // TODO: Merge whatever is going on here into the AccountSettings model properly
  vaultTimeout?: number;
  vaultTimeoutAction?: string = "lock";

  static fromJSON(obj: Jsonify<AccountSettings>): AccountSettings {
    return Object.assign(new AccountSettings(), obj, {
      environmentUrls: Object.assign(new EnvironmentUrls(), obj?.environmentUrls),
      pinProtected: EncryptionPair.fromJSON<string, EncString>(
        obj?.pinProtected,
        EncString.fromJSON
      ),
    });
  }
}

export type AccountSettingsSettings = {
  equivalentDomains?: { [id: string]: any };
};

export class AccountTokens {
  accessToken?: string;
  refreshToken?: string;
  securityStamp?: string;

  static fromJSON(obj: Jsonify<AccountTokens>): AccountTokens {
    return Object.assign(new AccountTokens(), obj);
  }
}

export class Account {
  data?: AccountData = new AccountData();
  keys?: AccountKeys = new AccountKeys();
  profile?: AccountProfile = new AccountProfile();
  settings?: AccountSettings = new AccountSettings();
  tokens?: AccountTokens = new AccountTokens();

  constructor(init: Partial<Account>) {
    Object.assign(this, {
      data: {
        ...new AccountData(),
        ...init?.data,
      },
      keys: {
        ...new AccountKeys(),
        ...init?.keys,
      },
      profile: {
        ...new AccountProfile(),
        ...init?.profile,
      },
      settings: {
        ...new AccountSettings(),
        ...init?.settings,
      },
      tokens: {
        ...new AccountTokens(),
        ...init?.tokens,
      },
    });
  }

  static fromJSON(json: Jsonify<Account>): Account {
    return Object.assign(new Account({}), json, {
      keys: AccountKeys.fromJSON(json?.keys),
      profile: AccountProfile.fromJSON(json?.profile),
      settings: AccountSettings.fromJSON(json?.settings),
      tokens: AccountTokens.fromJSON(json?.tokens),
    });
  }
}
