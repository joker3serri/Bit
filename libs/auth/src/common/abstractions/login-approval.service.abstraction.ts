import { LoginApprovalComponent } from "@bitwarden/auth/angular";

export abstract class LoginApprovalServiceAbstraction {
  /**
   * Runs initialization logic for the LoginApprovalComponent.
   */
  abstract onInit: (loginApprovalComponent: LoginApprovalComponent) => Promise<void>;
}
