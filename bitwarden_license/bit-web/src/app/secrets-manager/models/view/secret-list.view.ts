import { View } from "@bitwarden/common/models/view/view";

import { ProjectsMappedToSecret } from "./projectsMappedToSecret";

export class SecretListView implements View {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
  projects: ProjectsMappedToSecret[];
}
