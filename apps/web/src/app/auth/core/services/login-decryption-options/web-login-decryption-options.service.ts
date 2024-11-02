import { inject } from "@angular/core";

import {
  LoginDecryptionOptionsService,
  DefaultLoginDecryptionOptionsService,
} from "@bitwarden/auth/angular";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";

import { RouterService } from "../../../../core/router.service";
import { AcceptOrganizationInviteService } from "../../../organization-invite/accept-organization.service";

export class WebLoginDecryptionOptionsService
  extends DefaultLoginDecryptionOptionsService
  implements LoginDecryptionOptionsService
{
  protected routerService = inject(RouterService);
  protected acceptOrganizationInviteService = inject(AcceptOrganizationInviteService);
  protected validationService = inject(ValidationService);

  override async handleCreateUserSuccess(): Promise<void> {
    try {
      // Invites from TDE orgs go through here, but the invite is
      // accepted while being enrolled in admin recovery. So we need to clear
      // the redirect and stored org invite.
      await this.routerService.getAndClearLoginRedirectUrl();
      await this.acceptOrganizationInviteService.clearOrganizationInvitation();

      // await this.router.navigate(["/vault"]); // TODO-rr-bw: move routing to component?
    } catch (error) {
      this.validationService.showError(error);
    }
  }
}
