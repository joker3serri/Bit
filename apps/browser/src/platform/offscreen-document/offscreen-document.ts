import { defaultIfEmpty, filter, firstValueFrom, fromEvent, map, Subject, takeUntil } from "rxjs";

import { ConsoleLogService } from "@bitwarden/common/platform/services/console-log.service";

import { BrowserApi } from "../browser/browser-api";
import BrowserClipboardService from "../services/browser-clipboard.service";

import {
  OffscreenDocumentExtensionMessage,
  OffscreenDocumentExtensionMessageHandlers,
  OffscreenDocument as OffscreenDocumentInterface,
} from "./abstractions/offscreen-document";

// TTL (time to live) is not strictly required but avoids tying up memory resources if inactive
const workerTTL = 3 * 60000; // 3 minutes

class OffscreenDocument implements OffscreenDocumentInterface {
  private consoleLogService: ConsoleLogService = new ConsoleLogService(false);
  private webWorker: Worker;
  private webWorkerTimeout: number | NodeJS.Timeout;
  private clearWebWorker$ = new Subject<void>();
  private readonly extensionMessageHandlers: OffscreenDocumentExtensionMessageHandlers = {
    offscreenCopyToClipboard: ({ message }) => this.handleOffscreenCopyToClipboard(message),
    offscreenReadFromClipboard: () => this.handleOffscreenReadFromClipboard(),
    offscreenDecryptItems: ({ message }) => this.handleOffscreenDecryptItems(message),
  };

  /**
   * Initializes the offscreen document extension.
   */
  init() {
    this.setupExtensionMessageListener();
  }

  /**
   * Copies the given text to the user's clipboard.
   *
   * @param message - The extension message containing the text to copy
   */
  private async handleOffscreenCopyToClipboard(message: OffscreenDocumentExtensionMessage) {
    await BrowserClipboardService.copy(self, message.text);
  }

  /**
   * Reads the user's clipboard and returns the text.
   */
  private async handleOffscreenReadFromClipboard() {
    return await BrowserClipboardService.read(self);
  }

  private async handleOffscreenDecryptItems(
    message: OffscreenDocumentExtensionMessage,
  ): Promise<string> {
    const { decryptRequestId, decryptRequest } = message;
    if (!decryptRequest) {
      return "[]";
    }

    this.webWorker ??= new Worker(
      new URL(
        /* webpackChunkName: 'encrypt-worker' */
        "@bitwarden/common/platform/services/cryptography/encrypt.worker.ts",
        import.meta.url,
      ),
    );
    this.restartWebWorkerTimeout();
    this.webWorker.postMessage(decryptRequest);

    return await firstValueFrom(
      fromEvent(this.webWorker, "message").pipe(
        filter((response: MessageEvent) => response.data?.id === decryptRequestId),
        map((response) => response.data.items),
        takeUntil(this.clearWebWorker$),
        defaultIfEmpty("[]"),
      ),
    );
  }

  private clearWebWorker() {
    this.clearWebWorker$.next();
    this.webWorker?.terminate();
    this.webWorker = null;
    this.clearWebWorkerTimeout();
  }

  private restartWebWorkerTimeout() {
    this.clearWebWorkerTimeout();
    this.webWorkerTimeout = globalThis.setTimeout(() => this.clearWebWorker(), workerTTL);
  }

  private clearWebWorkerTimeout() {
    if (this.webWorkerTimeout != null) {
      globalThis.clearTimeout(this.webWorkerTimeout);
    }
  }

  /**
   * Sets up the listener for extension messages.
   */
  private setupExtensionMessageListener() {
    BrowserApi.messageListener("offscreen-document", this.handleExtensionMessage);
  }

  /**
   * Handles extension messages sent to the extension background.
   *
   * @param message - The message received from the extension
   * @param sender - The sender of the message
   * @param sendResponse - The response to send back to the sender
   */
  private handleExtensionMessage = (
    message: OffscreenDocumentExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    const handler: CallableFunction | undefined = this.extensionMessageHandlers[message?.command];
    if (!handler) {
      return;
    }

    const messageResponse = handler({ message, sender });
    if (!messageResponse) {
      return;
    }

    Promise.resolve(messageResponse)
      .then((response) => sendResponse(response))
      .catch((error) =>
        this.consoleLogService.error(`Error resolving extension message response: ${error}`),
      );
    return true;
  };
}

(() => {
  const offscreenDocument = new OffscreenDocument();
  offscreenDocument.init();
})();
