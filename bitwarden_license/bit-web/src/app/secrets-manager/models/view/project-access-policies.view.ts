import { View } from "@bitwarden/common/models/view/view";

import {
  GroupProjectAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "./access-policy.view";

export class ProjectAccessPoliciesView extends View {
  userAccessPolicies: UserProjectAccessPolicyView[];
  groupAccessPolicies: GroupProjectAccessPolicyView[];
  serviceAccountAccessPolicies: ServiceAccountProjectAccessPolicyView[];
}
