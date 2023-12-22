import { ContentMessageHandler as ContentMessageHandlerInterface } from "./abstractions/content-message-handler";

class ContentMessageHandler implements ContentMessageHandlerInterface {
  private forwardCommands = [
    "bgUnlockPopoutOpened",
    "addToLockedVaultPendingNotifications",
    "unlockCompleted",
    "addedCipher",
  ];

  init() {
    window.addEventListener("message", this.handleWindowMessage, false);
    chrome.runtime.onMessage.addListener(this.handleExtensionMessage);
  }

  private handleWindowMessage = (event: MessageEvent) => {
    if (event.source !== window) {
      return;
    }

    if (event.data.command && event.data.command === "authResult") {
      chrome.runtime.sendMessage({
        command: event.data.command,
        code: event.data.code,
        state: event.data.state,
        lastpass: event.data.lastpass,
        referrer: event.source.location.hostname,
      });
    }

    if (event.data.command && event.data.command === "webAuthnResult") {
      chrome.runtime.sendMessage({
        command: event.data.command,
        data: event.data.data,
        remember: event.data.remember,
        referrer: event.source.location.hostname,
      });
    }
  };

  private handleExtensionMessage = (message: any) => {
    if (this.forwardCommands.includes(message.command)) {
      chrome.runtime.sendMessage(message);
    }
  };

  destroy = () => {
    window.removeEventListener("message", this.handleWindowMessage);
    chrome.runtime.onMessage.removeListener(this.handleExtensionMessage);
  };
}

export default ContentMessageHandler;
