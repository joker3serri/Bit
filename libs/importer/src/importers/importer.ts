import { ImportResult } from "../models/import-result";

export interface Importer {
  organizationId: string;
  promptForPassword_callback: () => Promise<string>;
  parse(data: string): Promise<ImportResult>;
}
