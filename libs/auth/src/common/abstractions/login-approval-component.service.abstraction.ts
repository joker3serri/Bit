import { LoginApprovalComponent } from "@bitwarden/auth/angular";

export abstract class LoginApprovalComponentServiceAbstraction {
  /**
   * Runs initialization logic for the LoginApprovalComponent.
   */
  abstract onInit: (loginApprovalComponent: LoginApprovalComponent) => Promise<void>;
}
