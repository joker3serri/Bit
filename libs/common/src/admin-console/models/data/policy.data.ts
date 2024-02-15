import { Jsonify } from "type-fest";

import { PolicyType } from "../../enums";
import { PolicyResponse } from "../response/policy.response";

export class PolicyData {
  id: string;
  organizationId: string;
  type: PolicyType;
  data: any;
  enabled: boolean;

  constructor(response?: PolicyResponse) {
    if (response == null) {
      return;
    }

    this.id = response.id;
    this.organizationId = response.organizationId;
    this.type = response.type;
    this.data = response.data;
    this.enabled = response.enabled;
  }

  static fromJSON(obj: Jsonify<PolicyData>) {
    return Object.assign(new PolicyData(), obj);
  }
}
