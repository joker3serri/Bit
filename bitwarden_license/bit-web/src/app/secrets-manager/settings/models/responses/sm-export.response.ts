import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import { ExportedProjectResponse } from "./exported-project.response";
import { ExportedSecretResponse } from "./exported-secret.response";

export class SecretsManagerExportResponse extends BaseResponse {
  projects: ExportedProjectResponse[];
  secrets: ExportedSecretResponse[];

  constructor(response: any) {
    super(response);

    const projects = this.getResponseProperty("Projects");
    const secrets = this.getResponseProperty("Secrets");

    this.projects = projects?.map((k: any) => new ExportedProjectResponse(k));
    this.secrets = secrets?.map((k: any) => new ExportedSecretResponse(k));
  }
}
