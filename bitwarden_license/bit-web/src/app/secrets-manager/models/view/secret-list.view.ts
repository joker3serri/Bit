import { View } from "@bitwarden/common/models/view/view";

import { ProjectsMappedToSecretView } from "./projects-mapped-to-secret-view";

export class SecretListView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
  projects: ProjectsMappedToSecretView[];
}
