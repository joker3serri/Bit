import { ImportedProjectRequest } from "./imported-project.request";
import { ImportedSecretRequest } from "./imported-secret.request";

export class SMImportRequest {
  projects: ImportedProjectRequest[];
  secrets: ImportedSecretRequest[];
}
