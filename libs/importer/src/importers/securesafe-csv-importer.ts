import { ImportResult } from "../models/import-result";

import { BaseImporter } from "./base-importer";
import { Importer } from "./importer";

export class SecureSafeCsvImporter extends BaseImporter implements Importer {
  parse(data: string): Promise<ImportResult> {
    const result = new ImportResult();
    const results = this.parseCsv(data, true);
    if (results == null) {
      result.success = false;
      return Promise.resolve(result);
    }

    // SecureSafe currently exports CSV files with headers that are surrounded by slashes - 09/02/2024
    // This removes the slashes, if present.
    const headers = Object.keys(results[0]);
    const transformedHeaders = headers.map((header) =>
      header.startsWith("/") && header.endsWith("/") ? header.slice(1, -1) : header,
    );
    const remappedResults = results.map((row) => {
      const remappedRow: any = {};
      transformedHeaders.forEach((header, index) => {
        let value = row[headers[index]];
        if (typeof value === "string" && value.startsWith("/") && value.endsWith("/")) {
          value = value.slice(1, -1);
        }
        remappedRow[header] = value;
      });
      return remappedRow;
    });

    // The url field can be in different case formats.
    const urlField = Object.keys(remappedResults[0]).find((k) => /url/i.test(k));
    remappedResults.forEach((value) => {
      const cipher = this.initLoginCipher();
      cipher.name = this.getValueOrDefault(value.Title);
      cipher.notes = this.getValueOrDefault(value.Comment);
      cipher.login.uris = this.makeUriArray(value[urlField]);
      cipher.login.password = this.getValueOrDefault(value.Password);
      cipher.login.username = this.getValueOrDefault(value.Username);
      this.cleanupCipher(cipher);
      result.ciphers.push(cipher);
    });

    result.success = true;
    return Promise.resolve(result);
  }
}
