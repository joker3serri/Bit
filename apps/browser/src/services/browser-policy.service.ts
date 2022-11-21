import { BehaviorSubject } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { PolicyService } from "@bitwarden/common/services/policy/policy.service";

import { browserSession, sessionSync } from "../decorators/session-sync-observable";

import { BrowserStateService } from "./abstractions/browser-state.service";

@browserSession
export class BrowserPolicyService extends PolicyService {
  @sessionSync({ ctor: Policy, initializeAs: "array" })
  protected _policies: BehaviorSubject<Policy[]>;

  constructor(stateService: BrowserStateService, organizationService: OrganizationService) {
    super(stateService, organizationService);
  }
}
