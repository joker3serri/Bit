import { View } from "@bitwarden/common/models/view/view";

import { ProjectsMappedToSecretResponse } from "../../secrets/responses/projects-mapped-to-secret-response";

export class SecretListView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
  projects: ProjectsMappedToSecretResponse[];
}
