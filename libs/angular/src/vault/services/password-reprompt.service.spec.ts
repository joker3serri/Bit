import { MockProxy, mock } from "jest-mock-extended";

import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

import { ModalService } from "../../services/modal.service";

import { PasswordRepromptService } from "./password-reprompt.service";

describe("PasswordRepromptService", () => {
  let passwordRepromptService: PasswordRepromptService;

  let stateService: MockProxy<StateService>;
  let modalService: MockProxy<ModalService>;
  let keyConnectorService: MockProxy<KeyConnectorService>;

  beforeEach(() => {
    stateService = mock<StateService>();
    modalService = mock<ModalService>();
    keyConnectorService = mock<KeyConnectorService>();

    passwordRepromptService = new PasswordRepromptService(
      modalService,
      keyConnectorService,
      stateService
    );
  });

  describe("enabled()", () => {
    it("returns false if Key Connector is enabled", async () => {
      keyConnectorService.getUsesKeyConnector.mockResolvedValue(true);
      stateService.getAccountDecryptionOptions.mockResolvedValue({ hasMasterPassword: true });

      expect(await passwordRepromptService.enabled()).toBe(false);
    });
    it("returns false if a user does not have a master password", async () => {
      keyConnectorService.getUsesKeyConnector.mockResolvedValue(false);
      stateService.getAccountDecryptionOptions.mockResolvedValue({ hasMasterPassword: false });

      expect(await passwordRepromptService.enabled()).toBe(false);
    });
    it("returns true if Key Connector is not enabled and the user has a master password", async () => {
      keyConnectorService.getUsesKeyConnector.mockResolvedValue(false);
      stateService.getAccountDecryptionOptions.mockResolvedValue({ hasMasterPassword: true });

      expect(await passwordRepromptService.enabled()).toBe(true);
    });
  });
});
