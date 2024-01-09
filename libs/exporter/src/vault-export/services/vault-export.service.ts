import { Utils } from "@bitwarden/common/platform/misc/utils";

import { IndividualVaultExportServiceAbstraction } from "./individual-vault-export.service.abstraction";
import { OrganizationVaultExportServiceAbstraction } from "./org-vault-export.service.abstraction";
import { ExportFormat, VaultExportServiceAbstraction } from "./vault-export.service.abstraction";

export class VaultExportService implements VaultExportServiceAbstraction {
  constructor(
    private individualVaultExportService: IndividualVaultExportServiceAbstraction,
    private organizationVaultExportService?: OrganizationVaultExportServiceAbstraction,
  ) {}
  async getExport(format: ExportFormat = "csv"): Promise<string> {
    return this.individualVaultExportService.getExport(format);
  }

  async getPasswordProtectedExport(password: string): Promise<string> {
    return this.individualVaultExportService.getPasswordProtectedExport(password);
  }

  async getOrganizationExport(organizationId: string, format?: ExportFormat): Promise<string> {
    if (this.organizationVaultExportService == null) {
      throw new Error("Organization export service must be set");
    }

    if (Utils.isNullOrWhitespace(organizationId)) {
      throw new Error("OrganizationId must be set");
    }

    return this.organizationVaultExportService.getOrganizationExport(organizationId, format);
  }

  async getOrganizationPasswordProtectedExport(
    organizationId: string,
    password: string,
  ): Promise<string> {
    if (this.organizationVaultExportService == null) {
      return;
    }

    return this.organizationVaultExportService.getPasswordProtectedExport(password, organizationId);
  }

  getFileName(prefix?: string, extension?: string): string {
    return this.individualVaultExportService.getFileName(prefix, extension);
  }
}
