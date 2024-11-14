import { LoginApprovalComponentServiceAbstraction } from "../../common/abstractions/login-approval-component.service.abstraction";

import { LoginApprovalComponent } from "./login-approval.component";

export class DefaultLoginApprovalService implements LoginApprovalComponentServiceAbstraction {
  /**
   * No-op implementation of the onInit method.
   * @returns
   */
  async onInit(loginApprovalComponent: LoginApprovalComponent): Promise<void> {
    return;
  }
}
