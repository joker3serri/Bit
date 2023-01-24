import { EncString } from "@bitwarden/common/models/domain/enc-string";

export class ImportedSecretRequest {
  id: string;
  key: EncString;
  value: EncString;
  note: EncString;
  projectIds: string[];
}
