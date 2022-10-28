import { BaseResponse } from "@bitwarden/common/models/response/base.response";

import { ProjectsMappedToSecretResponse } from "./projects-mapped-to-secret.response";
import { SecretListItemResponse } from "./secret-list-item.response";

export class SecretWithProjectsListResponse extends BaseResponse {
  secrets: SecretListItemResponse[];
  projects: ProjectsMappedToSecretResponse[];

  constructor(response: any) {
    super(response);
    const secrets = this.getResponseProperty("secrets");
    const projects = this.getResponseProperty("projects");
    this.projects =
      projects == null ? null : projects.map((k: any) => new ProjectsMappedToSecretResponse(k)); //decrypt the project names here?
    this.secrets = secrets == null ? [] : secrets.map((dr: any) => new SecretListItemResponse(dr));
  }
}
