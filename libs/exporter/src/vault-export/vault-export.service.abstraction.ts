export type ExportFormat = "csv" | "json" | "encrypted_json";

export abstract class VaultExportServiceAbstraction {
  getExport: (format?: ExportFormat, organizationId?: string) => Promise<string>;
  getPasswordProtectedExport: (password: string, organizationId?: string) => Promise<string>;
  getOrganizationExport: (organizationId: string, format?: ExportFormat) => Promise<string>;
  getFileName: (prefix?: string, extension?: string) => string;
}
