type OffscreenDocumentExtensionMessage = {
  [key: string]: any;
  command: string;
  text?: string;
  decryptRequestId?: string;
  decryptRequest?: string;
};

type OffscreenExtensionMessageEventParams = {
  message: OffscreenDocumentExtensionMessage;
  sender: chrome.runtime.MessageSender;
};

type OffscreenDocumentExtensionMessageHandlers = {
  [key: string]: ({ message, sender }: OffscreenExtensionMessageEventParams) => any;
  offscreenCopyToClipboard: ({ message }: OffscreenExtensionMessageEventParams) => any;
  offscreenReadFromClipboard: () => any;
  offscreenDecryptItems: ({ message }: OffscreenExtensionMessageEventParams) => Promise<string>;
};

interface OffscreenDocument {
  init(): void;
}

export {
  OffscreenDocumentExtensionMessage,
  OffscreenDocumentExtensionMessageHandlers,
  OffscreenDocument,
};
