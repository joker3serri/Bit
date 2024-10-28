import { CipherType } from "@bitwarden/common/vault/enums";

import { PasswordXPCsvImporter } from "../src/importers";
import { ImportResult } from "../src/models/import-result";

import { withoutFolders } from "./test-data/passwordxp-csv/passwordxp-without-folders.csv";

describe("PasswordXPCsvImporter", () => {
  let importer: PasswordXPCsvImporter;

  beforeEach(() => {
    importer = new PasswordXPCsvImporter();
  });

  it("should return success false if CSV data is null", async () => {
    const data = "";
    const result: ImportResult = await importer.parse(data);
    expect(result.success).toBe(false);
  });

  it("should skip rows starting with >>>", async () => {
    const data = `Title;User name;Account;URL;Password;Modified;Created;Expire on;Description;Modified by
>>>`;
    const result: ImportResult = await importer.parse(data);
    expect(result.success).toBe(true);
    expect(result.ciphers.length).toBe(0);
  });

  it("should parse CSV data and return success true", async () => {
    const result: ImportResult = await importer.parse(withoutFolders);
    expect(result.success).toBe(true);
    expect(result.ciphers.length).toBe(4);

    let cipher = result.ciphers.shift();
    expect(cipher.type).toBe(CipherType.Login);
    expect(cipher.name).toBe("Title2");
    expect(cipher.notes).toBe("Test Notes");
    expect(cipher.login.username).toBe("Username2");
    expect(cipher.login.password).toBe("12345678");
    expect(cipher.login.uris[0].uri).toBe("http://URL2.com");

    cipher = result.ciphers.shift();
    expect(cipher.type).toBe(CipherType.Login);
    expect(cipher.name).toBe("Title Test 1");
    expect(cipher.notes).toBe("Test Notes 2");
    expect(cipher.login.username).toBe("Username1");
    expect(cipher.login.password).toBe("Password1");
    expect(cipher.login.uris[0].uri).toBe("http://URL1.com");

    cipher = result.ciphers.shift();
    expect(cipher.type).toBe(CipherType.SecureNote);
    expect(cipher.name).toBe("Certificate 1");
    expect(cipher.notes).toBe("Test Notes Certicate 1");

    cipher = result.ciphers.shift();
    expect(cipher.type).toBe(CipherType.Login);
    expect(cipher.name).toBe("test");
    expect(cipher.notes).toBe("Test Notes 3");
    expect(cipher.login.username).toBe("testtest");
    expect(cipher.login.password).toBe("test");
    expect(cipher.login.uris[0].uri).toBe("http://test");
  });
});
