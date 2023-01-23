import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import { ExportedProject } from "./exported-project.response";
import { ExportedSecret } from "./exported-secret.response";

export class SMExportResponse extends BaseResponse {
  projects: ExportedProject[];
  secrets: ExportedSecret[];

  constructor(response: any) {
    super(response);

    const projects = this.getResponseProperty("Projects");
    const secrets = this.getResponseProperty("Secrets");

    this.projects = projects == null ? null : projects.map((k: any) => new ExportedProject(k));
    this.secrets = secrets == null ? null : secrets.map((k: any) => new ExportedProject(k));
  }
}
