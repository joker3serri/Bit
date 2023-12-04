import { mock } from "jest-mock-extended";

import { PolicyService } from "@bitwarden/common/admin-console/services/policy/policy.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { AuthService } from "@bitwarden/common/auth/services/auth.service";
import { ConfigService } from "@bitwarden/common/platform/services/config/config.service";

import NotificationBackground from "../../autofill/background/notification.background";
import { createPortSpyMock } from "../../autofill/jest/autofill-mocks";
import {
  flushPromises,
  sendPortMessage,
  triggerRuntimeOnConnectEvent,
} from "../../autofill/jest/testing-utils";
import { FilelessImportPort, FilelessImportType } from "../enums/fileless-import.enums";

import FilelessImporterBackground from "./fileless-importer.background";

describe("FilelessImporterBackground ", () => {
  let filelessImporterBackground: FilelessImporterBackground;
  const configService = mock<ConfigService>();
  const authService = mock<AuthService>();
  const notificationBackground = mock<NotificationBackground>();
  const policyService = mock<PolicyService>();

  beforeEach(() => {
    filelessImporterBackground = new FilelessImporterBackground(
      configService,
      authService,
      policyService,
      notificationBackground,
    );
    filelessImporterBackground.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("sets up the port message listeners on initialization of the class", () => {
      expect(chrome.runtime.onConnect.addListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("handle ports onConnect", () => {
    let lpImporterPort: chrome.runtime.Port;

    beforeEach(() => {
      lpImporterPort = createPortSpyMock(FilelessImportPort.LpImporter);
      jest.spyOn(authService, "getAuthStatus").mockResolvedValue(AuthenticationStatus.Unlocked);
      jest.spyOn(configService, "getFeatureFlag").mockResolvedValue(true);
      jest
        .spyOn(filelessImporterBackground as any, "removeIndividualVault")
        .mockResolvedValue(false);
    });

    it("ignores the port connection if the port name is not present in the set of filelessImportNames", async () => {
      const port = createPortSpyMock("some-other-port");

      triggerRuntimeOnConnectEvent(port);
      await flushPromises();

      expect(port.postMessage).not.toHaveBeenCalled();
    });

    it("posts a message to the port indicating that the fileless import feature is disabled if the user's auth status is not unlocked", async () => {
      jest.spyOn(authService, "getAuthStatus").mockResolvedValue(AuthenticationStatus.Locked);

      triggerRuntimeOnConnectEvent(lpImporterPort);
      await flushPromises();

      expect(lpImporterPort.postMessage).toHaveBeenCalledWith({
        command: "verifyFeatureFlag",
        filelessImportEnabled: false,
      });
    });

    it("posts a message to the port indicating that the fileless import feature is disabled if the user's policy removes individual vaults", async () => {
      jest
        .spyOn(filelessImporterBackground as any, "removeIndividualVault")
        .mockResolvedValue(true);

      triggerRuntimeOnConnectEvent(lpImporterPort);
      await flushPromises();

      expect(lpImporterPort.postMessage).toHaveBeenCalledWith({
        command: "verifyFeatureFlag",
        filelessImportEnabled: false,
      });
    });

    it("posts a message to the port indicating that the fileless import feature is disabled if the feature flag is turned off", async () => {
      jest.spyOn(configService, "getFeatureFlag").mockResolvedValue(false);

      triggerRuntimeOnConnectEvent(lpImporterPort);
      await flushPromises();

      expect(lpImporterPort.postMessage).toHaveBeenCalledWith({
        command: "verifyFeatureFlag",
        filelessImportEnabled: false,
      });
    });

    it("posts a message to the port indicating that the fileless import feature is enabled", async () => {
      triggerRuntimeOnConnectEvent(lpImporterPort);
      await flushPromises();

      expect(lpImporterPort.postMessage).toHaveBeenCalledWith({
        command: "verifyFeatureFlag",
        filelessImportEnabled: true,
      });
    });
  });

  describe("port messages", () => {
    let notificationPort: chrome.runtime.Port;
    let lpImporterPort: chrome.runtime.Port;

    beforeEach(async () => {
      jest.spyOn(authService, "getAuthStatus").mockResolvedValue(AuthenticationStatus.Unlocked);
      jest.spyOn(configService, "getFeatureFlag").mockResolvedValue(true);
      jest
        .spyOn(filelessImporterBackground as any, "removeIndividualVault")
        .mockResolvedValue(false);
      triggerRuntimeOnConnectEvent(createPortSpyMock(FilelessImportPort.NotificationBar));
      triggerRuntimeOnConnectEvent(createPortSpyMock(FilelessImportPort.LpImporter));
      await flushPromises();
      notificationPort = filelessImporterBackground["importNotificationsPort"];
      lpImporterPort = filelessImporterBackground["lpImporterPort"];
    });

    it("skips handling a message if a message handler is not associated with the port message command", () => {
      sendPortMessage(notificationPort, { command: "commandNotFound" });

      expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
    });

    describe("import notification port messages", () => {
      describe("cancelFilelessImport", () => {
        it("sends a message to close the notification bar", async () => {
          sendPortMessage(notificationPort, { command: "cancelFilelessImport" });

          expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            1,
            {
              command: "closeNotificationBar",
            },
            null,
            expect.anything(),
          );
          expect(lpImporterPort.postMessage).not.toHaveBeenCalledWith({
            command: "triggerCsvDownload",
          });
        });

        it("triggers a download of the LP importer CSV", () => {
          sendPortMessage(notificationPort, {
            command: "cancelFilelessImport",
            importType: FilelessImportType.LP,
          });

          expect(lpImporterPort.postMessage).toHaveBeenCalledWith({
            command: "triggerCsvDownload",
          });
          expect(lpImporterPort.disconnect).toHaveBeenCalled();
        });
      });
    });

    describe("lp importer port messages", () => {
      describe("displayLpImportNotification", () => {
        it("creates a request fileless import notification", async () => {
          jest.spyOn(filelessImporterBackground["notificationBackground"], "requestFilelessImport");

          sendPortMessage(lpImporterPort, {
            command: "displayLpImportNotification",
          });
          await flushPromises();

          expect(
            filelessImporterBackground["notificationBackground"].requestFilelessImport,
          ).toHaveBeenCalledWith(lpImporterPort.sender.tab, FilelessImportType.LP);
        });
      });
    });
  });

  describe("handleImporterPortDisconnect", () => {
    it("resets the port properties to null", () => {
      const lpImporterPort = createPortSpyMock(FilelessImportPort.LpImporter);
      const notificationPort = createPortSpyMock(FilelessImportPort.NotificationBar);
      filelessImporterBackground["lpImporterPort"] = lpImporterPort;
      filelessImporterBackground["importNotificationsPort"] = notificationPort;

      filelessImporterBackground["handleImporterPortDisconnect"](lpImporterPort);

      expect(filelessImporterBackground["lpImporterPort"]).toBeNull();
      expect(filelessImporterBackground["importNotificationsPort"]).not.toBeNull();

      filelessImporterBackground["handleImporterPortDisconnect"](notificationPort);

      expect(filelessImporterBackground["importNotificationsPort"]).toBeNull();
    });
  });
});
