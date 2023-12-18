import { UriMatchType } from "../vault/enums";

export interface NeverDomain {
  uri: string;
  match: UriMatchType | null;
}
