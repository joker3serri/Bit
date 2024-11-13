import { LoginApprovalServiceAbstraction } from "../../common/abstractions/login-approval.service.abstraction";

import { LoginApprovalComponent } from "./login-approval.component";

export class DefaultLoginApprovalService implements LoginApprovalServiceAbstraction {
  /**
   * No-op implementation of the onInit method.
   * @returns
   */
  async onInit(loginApprovalComponent: LoginApprovalComponent): Promise<void> {
    return;
  }
}
