import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";

import { ZohoVaultCsvImporter } from "../src/importers";

import { data as samplezohovaultcsvdata } from "./test-data/zohovault/sample-zohovault-data.csv";

const CipherData = [
  {
    title: "should parse Zoho Vault CSV format",
    csv: samplezohovaultcsvdata,
    expected: Object.assign(new CipherView(), {
      id: null,
      organizationId: null,
      folderId: null,
      name: "XYZ Test",
      login: Object.assign(new LoginView(), {
        username: "email@domain.de",
        password: "PcY_IQEXIjKGj8YW",
        uris: [
          Object.assign(new LoginUriView(), {
            uri: "https://abc.xyz.de:5001/#/login",
          }),
        ],
        totp: "otpauth://totp?secret=PI2XO5TW0DF0SHTYOVZXOOBVHFEWM6JU&algorithm=SHA1&period=30&digits=6",
      }),
      type: 1,
      favorite: false,
    }),
  },
];

describe("Zoho Vault CSV Importer", () => {
  it("should not succeed given no data", async () => {
    const importer = new ZohoVaultCsvImporter();
    const result = await importer.parse("");
    expect(result != null).toBe(true);
    expect(result.success).toBe(false);
  });

  CipherData.forEach((data) => {
    it(data.title, async () => {
      const importer = new ZohoVaultCsvImporter();
      const result = await importer.parse(data.csv);
      expect(result != null).toBe(true);
      expect(result.ciphers.length).toBeGreaterThan(0);

      const cipher = result.ciphers.shift();
      let property: keyof typeof data.expected;
      for (property in data.expected) {
        // eslint-disable-next-line
        if (data.expected.hasOwnProperty(property)) {
          // eslint-disable-next-line
          expect(cipher.hasOwnProperty(property)).toBe(true);
          expect(cipher[property]).toEqual(data.expected[property]);
        }
      }
    });
  });
});
