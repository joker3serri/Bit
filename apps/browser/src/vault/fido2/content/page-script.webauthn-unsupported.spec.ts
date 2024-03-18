import {
  createAssertCredentialResultMock,
  createCreateCredentialResultMock,
  createCredentialCreationOptionsMock,
  createCredentialRequestOptionsMock,
} from "../../../autofill/spec/fido2-testing-utils";
import { WebauthnUtils } from "../webauthn-utils";

import { MessageType } from "./messaging/message";
import { Messenger } from "./messaging/messenger";

let messenger: Messenger;
jest.mock("./messaging/messenger", () => {
  return {
    Messenger: class extends jest.requireActual("./messaging/messenger").Messenger {
      static forDOMCommunication: any = jest.fn((window) => {
        const windowOrigin = window.location.origin;

        messenger = new Messenger({
          postMessage: (message, port) => window.postMessage(message, windowOrigin, [port]),
          addEventListener: (listener) => window.addEventListener("message", listener),
          removeEventListener: (listener) => window.removeEventListener("message", listener),
        });
        messenger.destroy = jest.fn();
        return messenger;
      });
    },
  };
});
jest.mock("../webauthn-utils");

describe("Fido2 page script without native WebAuthn support", () => {
  const mockCredentialCreationOptions = createCredentialCreationOptionsMock();
  const mockCreateCredentialsResult = createCreateCredentialResultMock();
  const mockCredentialRequestOptions = createCredentialRequestOptionsMock();
  const mockCredentialAssertResult = createAssertCredentialResultMock();
  require("./page-script");

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("creating WebAuthn credentials", () => {
    beforeEach(() => {
      messenger.request = jest.fn().mockResolvedValue({
        type: MessageType.CredentialCreationResponse,
        result: mockCreateCredentialsResult,
      });
    });

    it("creates and returns a WebAuthn credential", async () => {
      await navigator.credentials.create(mockCredentialCreationOptions);

      expect(WebauthnUtils.mapCredentialCreationOptions).toHaveBeenCalledWith(
        mockCredentialCreationOptions,
        false,
      );
      expect(WebauthnUtils.mapCredentialRegistrationResult).toHaveBeenCalledWith(
        mockCreateCredentialsResult,
      );
    });
  });

  describe("get WebAuthn credentials", () => {
    beforeEach(() => {
      messenger.request = jest.fn().mockResolvedValue({
        type: MessageType.CredentialGetResponse,
        result: mockCredentialAssertResult,
      });
    });

    it("gets and returns the WebAuthn credentials", async () => {
      await navigator.credentials.get(mockCredentialRequestOptions);

      expect(WebauthnUtils.mapCredentialRequestOptions).toHaveBeenCalledWith(
        mockCredentialRequestOptions,
        false,
      );
      expect(WebauthnUtils.mapCredentialAssertResult).toHaveBeenCalledWith(
        mockCredentialAssertResult,
      );
    });
  });
});
