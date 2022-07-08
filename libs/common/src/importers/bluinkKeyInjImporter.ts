import { CryptoService } from "../abstractions/crypto.service";
import { CryptoFunctionService } from "../abstractions/cryptoFunction.service";
import { I18nService } from "../abstractions/i18n.service";
import { CipherType } from "../enums/cipherType";
import { FieldType } from "../enums/fieldType";
import { SecureNoteType } from "../enums/secureNoteType";
import { ImportResult } from "../models/domain/importResult";
import { SymmetricCryptoKey } from "../models/domain/symmetricCryptoKey";
import { CardView } from "../models/view/cardView";
import { CipherView } from "../models/view/cipherView";
import { FieldView } from "../models/view/fieldView";
import { IdentityView } from "../models/view/identityView";
import { LoginView } from "../models/view/loginView";
import { SecureNoteView } from "../models/view/secureNoteView";

import { BaseImporter } from "./baseImporter";
import { Importer } from "./importer";

const VerifySalt = "aehwoFJS3489263n";
const DeriveSalt = "op9j2S=!34zzzun5";
const IV = "fedcba9876543210";

const ComboVersion1 = 0x78303031;

const ItemsVersion1 = 0x76303031;
const ItemsVersion2 = 0x76303032;
const ItemsVersion3 = 0x76303033;
const ItemsVersion4 = 0x76303034;

class ConsumableBytes {
  private readonly arr: Uint8Array;
  private offset = 0;

  constructor(arr: Uint8Array) {
    this.arr = arr;
  }

  bytes(length: number): Uint8Array {
    const res = this.arr.subarray(this.offset, this.offset + length);
    this.offset += length;
    return res;
  }
  int32(): number {
    const res =
      (this.arr[this.offset + 3] << 24) |
      (this.arr[this.offset + 2] << 16) |
      (this.arr[this.offset + 1] << 8) |
      this.arr[this.offset];
    this.offset += 4;
    return res;
  }
  string(length: number): string {
    const bytes = this.bytes(length);
    const ChunkSize = 0x8000;
    let result = "";
    for (let i = 0; i < length; i += ChunkSize) {
      result += String.fromCharCode.apply(null, bytes.subarray(i, i + ChunkSize));
    }
    return result.endsWith("\u0000") ? result.slice(0, -1) : result;
  }

  bString(): string {
    return this.string(this.int32());
  }
  bArray<T>(item: () => T) {
    const length = this.int32();
    return Array.from({ length }, item);
  }
}

export class BluinkKeyInjImporter extends BaseImporter implements Importer {
  private legacyPBKDF2 = true;
  private passwordVerificationData: Uint8Array;
  private encryptedKeyData: Uint8Array;

  constructor(
    protected cryptoService: CryptoService,
    protected i18nService: I18nService,
    protected cryptoFunctionService: CryptoFunctionService,
    private password: string
  ) {
    super();
  }

  async parse(arr: Uint8Array): Promise<ImportResult> {
    const result = new ImportResult();

    const fileData = this.parseHeader(arr);
    if (!fileData) {
      // Backup file not in expected format
      result.success = false;
      return result;
    }

    if (!(await this.checkPassword())) {
      result.success = false;
      result.errorMessage = this.i18nService.t("importEncKeyError");
      return result;
    }

    const decryptedKey = await this.decryptKey();
    const decryptedFileBytes = await this.decryptFile(decryptedKey, fileData);
    const parsed = this.parseData(new Uint8Array(decryptedFileBytes));

    // Now that we have the data as a JS object, build the result object
    parsed
      .filter((cred) => cred.uid !== "FIDO_AUTHENTICATOR_KEYHANDLE_UID")
      .forEach((cred) => {
        const cipher = new CipherView();

        const tryTakeField = (name: string) => {
          const index = cred.items.findIndex((c) => c.title === name);
          return index !== -1 ? cred.items.splice(index, 1)[0].value : null;
        };

        cipher.name = cred.title;
        cipher.favorite = false; // Bluink doesn't have favorites
        cipher.notes = tryTakeField("Notes") ?? "";
        // cipher.notes += `${cipher.notes !== null ? "\n\n" : ""}Bluink Key import data:\nTags: ${cred.tags !== "" ? cred.tags : "(none)"}\nImage path: ${cred.image !== "" ? cred.image : "(none)"}`;

        // Bluink doesn't have a concept of different types of credentials, so determine which one to enter it as based on what fields are present
        // Login, SecureNote, Card, Identity
        // These are the fields for each in bitwarden:
        // Login: Name, Username, Password, URI
        // Card: Name, Cardholder Name, Number, Brand, Expiration Month, Expiration Year, Security Code
        // Identity: Name, Title, First Name, Middle Name, Last Name, Username, Company, Social Security Number, Passport Number, License Number,
        //           Email, Phone, Address 1-3, City / Town, State / Province, Zip / Postal Code, Country
        // SecureNote: Name

        // We can use secure note as a fallback if we can't match the credential to a specific type

        // To count as a Login, a Bluink credential should have
        // - "Password" (or some variation including the phrase, like "Login Password")
        // Optional item fields:
        // - "Username" or "Account ID" or "Email Address" or "Account Name")
        // - "URL"

        // To count as a Card, a Bluink credential should have
        // - "Card Number"
        // Optional item fields:
        // - "Card Type"
        // - "Cardholder Name"
        // - "Expiry Month"
        // - "Expiry Year"
        // - "Security Code"

        // To count as an Identity, a Bluink credential should have at least one of
        // - "Address City"
        // - "Address Country"
        // - "Address State or Province"
        // - "Address Street"
        // - "Address Zip or Postal Code"
        // - "First Name"
        // - "Last Name"
        // - "Personal Email"
        // - "Phone (home)"
        // - "Phone (mobile)"
        // - "SSN or SIN"

        // Otherwise, the credential can be added as a SecureNote

        const identityMapping: {
          [key: string]: keyof IdentityView;
        } = {
          "Address City": "city",
          "Address Country": "country",
          "Address State or Province": "state",
          "Address Street": "address1",
          "Address Zip or Postal Code": "postalCode",
          "First Name": "firstName",
          "Last Name": "lastName",
          "Personal Email": "email",
          "Phone (home)": "phone",
          "Phone (mobile)": "phone",
          "SSN or SIN": "ssn",
        };

        const cardMapping: {
          [key: string]: keyof CardView;
        } = {
          "Card Number": "number",
          "Card Type": "brand",
          "Cardholder Name": "cardholderName",
          "Expiry Month": "expMonth",
          "Expiry Year": "expYear",
          "Security Code": "code",
        };

        const applyMapping = <TView>(mapping: { [key: string]: keyof TView }, view: TView) => {
          Object.entries(mapping).forEach(([bName, key]) => {
            if (!view[key]) {
              const value = tryTakeField(bName);
              if (value) {
                //@ts-expect-error - https://github.com/microsoft/TypeScript/issues/35103
                view[key] = value;
              }
            }
          });
        };

        cred.items = cred.items.filter((i) => !i.uid.includes("&PP")); // Remove old password items (Bluink saves password history as multiple password fields)

        if (cred.items.findIndex((c) => /password/i.test(c.title)) !== -1) {
          // case insensitive regex
          cipher.type = CipherType.Login;
          const login = new LoginView();

          login.username =
            ["Username", "User ID", "Account ID", "Account Name", "Email Address", "Email"].reduce<
              string | undefined
            >((acc, name) => acc ?? tryTakeField(name), undefined) ?? "--";
          const password = cred.items.find((c) => /password/i.test(c.title));
          login.passwordRevisionDate = password.time;
          login.password = password.value;
          tryTakeField(password.title);
          const urls = cred.items
            .filter((i) => i.title === "URL" && i.value.length > 0)
            .map(() => tryTakeField("URL"));
          if (urls.length > 0) {
            login.uris = this.makeUriArray(urls);
          }
          cipher.login = login;
        } else if (cred.items.findIndex((c) => c.title === "Card Number") !== -1) {
          cipher.type = CipherType.Card;
          const card = new CardView();
          applyMapping(cardMapping, card);
          cipher.card = card;
        } else if (
          Object.keys(identityMapping).some(
            (t) => cred.items.findIndex((c) => c.title === t) !== -1
          )
        ) {
          cipher.type = CipherType.Identity;
          const identity = new IdentityView();
          applyMapping(identityMapping, identity);
          cipher.identity = identity;
        } else {
          cipher.type = CipherType.SecureNote;
          const secureNote = new SecureNoteView();
          secureNote.type = SecureNoteType.Generic;
          cipher.secureNote = secureNote;
        }
        // Add the remaining items as custom fields
        cipher.fields = cred.items
          .filter((i) => i.value.length > 0)
          .map((i) => {
            const field = new FieldView();
            field.name = i.title;
            field.type = /password/i.test(i.title) ? FieldType.Hidden : FieldType.Text;
            field.value = i.value;
            return field;
          });
        result.ciphers.push(cipher);
      });

    result.success = true;
    return result;
  }

  private parseHeader(arr: Uint8Array) {
    let passwordDataLen = arr[0];

    if (passwordDataLen === 1) {
      this.legacyPBKDF2 = false;
      passwordDataLen = arr[1];
    } else {
      this.legacyPBKDF2 = true;
    }

    if (passwordDataLen !== 32) return false;
    const passwordDataStart = this.legacyPBKDF2 ? 1 : 2;
    const encryptedKeyStart = passwordDataStart + passwordDataLen;
    this.passwordVerificationData = arr.subarray(passwordDataStart, encryptedKeyStart);

    const encryptedKeyDataLen = arr[encryptedKeyStart];
    if (encryptedKeyDataLen !== 48) return false;
    const encryptedKeyDataStart = encryptedKeyStart + 1;
    const fileStart = encryptedKeyDataStart + encryptedKeyDataLen;
    this.encryptedKeyData = arr.subarray(encryptedKeyDataStart, fileStart);

    return arr.subarray(fileStart);
  }

  private async runPBKDF2(salt: string) {
    return this.legacyPBKDF2
      ? await this.runLegacyPBKDF2(this.password, VerifySalt, 100000)
      : await this.cryptoFunctionService.pbkdf2(this.password, salt, "sha256", 100000);
  }

  private async checkPassword() {
    const keyBits = await this.runPBKDF2(VerifySalt);
    return await this.cryptoFunctionService.compare(keyBits, this.passwordVerificationData);
  }

  private async runLegacyPBKDF2(
    password: string,
    salt: string,
    iterations: number
  ): Promise<ArrayBuffer> {
    // Unfortunately I have no way of implementing this/testing if this works as I don't have a legacy file to test with
    throw new Error("Legacy (broken) PBKDF2 implementation is not supported");
  }

  private async aesDecrypt(ciphertext: ArrayBuffer, key: SymmetricCryptoKey) {
    // The CryptoService.decryptFromBytes method assumes the IV is prepended to the input data
    // so we'll need to prepend the IV to the keybits
    // It also wants an enctype to be at the start, so add a 0
    const keyBitsWithIV = new Uint8Array(ciphertext.byteLength + IV.length + 1);
    keyBitsWithIV.set([0], 0);
    keyBitsWithIV.set(new Uint8Array(Uint8Array.from(IV, (c) => c.charCodeAt(0))), 1);
    keyBitsWithIV.set(new Uint8Array(ciphertext), IV.length + 1);

    return await this.cryptoService.decryptFromBytes(keyBitsWithIV, key);
  }

  private async decryptKey() {
    const keyBits = await this.runPBKDF2(DeriveSalt);
    return await this.aesDecrypt(this.encryptedKeyData, new SymmetricCryptoKey(keyBits));
  }

  private async decryptFile(key: ArrayBuffer, buf: ArrayBuffer) {
    return await this.aesDecrypt(buf, new SymmetricCryptoKey(key));
  }

  private parseData(arr: Uint8Array) {
    const c = new ConsumableBytes(arr);

    const version = c.int32();
    if (version !== ComboVersion1) throw new Error("Unsupported file format version");

    const itemsVersion = c.int32();
    if (itemsVersion < ItemsVersion1 || itemsVersion > ItemsVersion4)
      throw new Error("Unsupported items version");

    const utf8Decoder = new TextDecoder("utf-8");
    const utf8 = (v: string) => utf8Decoder.decode(Uint8Array.from(v, (c) => c.charCodeAt(0)));
    const req = <T>(v: number, builder: () => T) => (itemsVersion >= v ? builder() : null);

    return c.bArray(() => ({
      uid: c.bString(),
      title: utf8(c.bString()),
      flags: c.int32(), // Not sure what this is
      tags: req(ItemsVersion4, () => c.bString()), // ", " separated string of tags
      image: req(ItemsVersion2, () => c.bString()), // path to image in the Bluink Key app (so not useful)
      items: c.bArray(() => ({
        title: utf8(c.bString()),
        value: utf8(c.bString()),
        type: c.int32(),
        flags: c.int32(), // Not sure what this is, possibly a security level?
        uid: c.bString(),
        time: new Date(c.int32() * 1000),
      })),
    }));
  }
}
