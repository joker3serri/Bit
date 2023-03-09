import { PolicyType } from "../../enums/policy-type";
import { PolicyData } from "../data/policy.data";
import Domain from "../../../models/domain/domain-base";

export class Policy extends Domain {
  id: string;
  organizationId: string;
  type: PolicyType;
  data: any;
  enabled: boolean;

  constructor(obj?: PolicyData) {
    super();
    if (obj == null) {
      return;
    }

    this.id = obj.id;
    this.organizationId = obj.organizationId;
    this.type = obj.type;
    this.data = obj.data;
    this.enabled = obj.enabled;
  }
}
