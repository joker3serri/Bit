import { ImportedProjectRequest } from "./imported-project.request";
import { ImportedSecretRequest } from "./imported-secret.request";

export class SecretsManagerImportRequest {
  projects: ImportedProjectRequest[];
  secrets: ImportedSecretRequest[];
}
