import { MockProxy, mock } from "jest-mock-extended";

import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";

import { RouterService } from "../../../../core/router.service";
import { AcceptOrganizationInviteService } from "../../../organization-invite/accept-organization.service";

import { WebLoginDecryptionOptionsService } from "./web-login-decryption-options.service";

describe("WebLoginDecryptionOptionsService", () => {
  let service: WebLoginDecryptionOptionsService;

  let routerService: MockProxy<RouterService>;
  let acceptOrganizationInviteService: MockProxy<AcceptOrganizationInviteService>;
  let validationService: MockProxy<ValidationService>;

  beforeEach(() => {
    routerService = mock<RouterService>();
    acceptOrganizationInviteService = mock<AcceptOrganizationInviteService>();
    validationService = mock<ValidationService>();

    service = new WebLoginDecryptionOptionsService(
      routerService,
      acceptOrganizationInviteService,
      validationService,
    );
  });

  it("should instantiate the service", () => {
    expect(service).not.toBeFalsy();
  });

  describe("handleCreateUserSuccess()", () => {
    it("should clear the redirect URL and the org invite", async () => {
      await service.handleCreateUserSuccess();

      expect(routerService.getAndClearLoginRedirectUrl).toHaveBeenCalled();
      expect(acceptOrganizationInviteService.clearOrganizationInvitation).toHaveBeenCalled();
    });
  });
});
