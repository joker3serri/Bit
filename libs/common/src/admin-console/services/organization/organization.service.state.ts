import { Jsonify } from "type-fest";

import { KeyDefinition, ORGANIZATIONS_DISK } from "../../../platform/state";
import { OrganizationData } from "../../models/data/organization.data";

export const ORGANIZATIONS = KeyDefinition.record<OrganizationData>(
  ORGANIZATIONS_DISK,
  "organizations",
  {
    deserializer: (obj: Jsonify<OrganizationData>) => OrganizationData.fromJSON(obj),
  },
);
