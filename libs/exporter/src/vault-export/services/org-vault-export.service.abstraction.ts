import { ExportFormat } from "./vault-export.service.abstraction";

export abstract class OrganizationVaultExportServiceAbstraction {
  getPasswordProtectedExport: (organizationId: string, password: string) => Promise<string>;
  getOrganizationExport: (organizationId: string, format: ExportFormat) => Promise<string>;
}
