import { View } from "@bitwarden/common/models/view/view";

import { ProjectsMappedToSecretListView } from "./projects-mapped-to-secret-list.view";

export class SecretListView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
  projects: ProjectsMappedToSecretListView[];
}
