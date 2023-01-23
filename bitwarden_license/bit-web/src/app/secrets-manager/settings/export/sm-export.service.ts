import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";

import { SMExport } from "../../models/porting/sm-export";
import { SMExportProject } from "../../models/porting/sm-export-project";
import { SMExportSecret } from "../../models/porting/sm-export-secret";
import { SMExportResponse } from "../responses/sm-export.response";

@Injectable({
  providedIn: "root",
})
export class SMExportService {
  constructor(
    private apiService: ApiService,
    private encryptService: EncryptService,
    private cryptoService: CryptoService
  ) {}

  async getExport(organizationId: string, exportFormat = "json"): Promise<string> {
    const r = await this.apiService.send(
      "GET",
      "/sm/" + organizationId + "/export?format=" + exportFormat,
      null,
      true,
      true
    );

    return JSON.stringify(this.decryptExport(organizationId, new SMExportResponse(r)), null, "  ");
  }

  private async decryptExport(
    organizationId: string,
    exportData: SMExportResponse
  ): Promise<SMExport> {
    const orgKey = await this.getOrganizationKey(organizationId);
    const decryptedExport = new SMExport();

    exportData.projects.forEach(async (p) => {
      const project = new SMExportProject();
      project.id = p.id;
      project.name = await this.encryptService.decryptToUtf8(new EncString(p.name), orgKey);
      decryptedExport.projects.push(project);
    });

    exportData.secrets.forEach(async (s) => {
      const secret = new SMExportSecret();

      const [key, value, note] = await Promise.all([
        this.encryptService.decryptToUtf8(new EncString(s.key), orgKey),
        this.encryptService.decryptToUtf8(new EncString(s.value), orgKey),
        this.encryptService.decryptToUtf8(new EncString(s.note), orgKey),
      ]);

      secret.id = s.id;
      secret.key = key;
      secret.value = value;
      secret.note = note;
      secret.projectIds = s.projectIds;

      decryptedExport.secrets.push(secret);
    });

    return decryptedExport;
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }
}
