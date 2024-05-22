import { SecretAccessPoliciesRequest } from "./secret-access-policies.request";

export class SecretRequest {
  key: string;
  value: string;
  note: string;
  projectIds?: string[];
  accessPoliciesRequests: SecretAccessPoliciesRequest;
}
