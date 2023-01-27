export class SecretsManagerExport {
  projects: SMExportProject[];
  secrets: SMExportSecret[];
}

export class SMExportProject {
  id: string;
  name: string;
}

export class SMExportSecret {
  id: string;
  key: string;
  value: string;
  note: string;
  projectIds: string[];
}
