import { Message, MessageType } from "./message";

const SENDER = "bitwarden-webauthn";

type PostMessageFunction = (message: MessageWithMetadata, remotePort: MessagePort) => void;

export type Channel = {
  addEventListener: (listener: (message: MessageEvent<MessageWithMetadata>) => void) => void;
  postMessage: PostMessageFunction;
};

export type Metadata = { SENDER: typeof SENDER; requestId: string };
export type MessageWithMetadata = Message & { metadata: Metadata };
type Handler = (
  message: MessageWithMetadata,
  abortController?: AbortController
) => Promise<Message | undefined>;

// TODO: This class probably duplicates functionality but I'm not especially familiar with
// the inner workings of the browser extension yet.
// If you see this in a code review please comment on it!

export class Messenger {
  static forDOMCommunication(window: Window) {
    const windowOrigin = window.location.origin;

    return new Messenger({
      postMessage: (message, port) => window.postMessage(message, windowOrigin, [port]),
      addEventListener: (listener) =>
        window.addEventListener("message", (event: MessageEvent<unknown>) => {
          if (event.origin !== windowOrigin) {
            return;
          }

          listener(event as MessageEvent<MessageWithMetadata>);
        }),
    });
  }

  handler?: Handler;
  constructor(private broadcastChannel: Channel) {
    this.broadcastChannel.addEventListener(async (event) => {
      if (this.handler === undefined) {
        return;
      }

      const message = event.data;
      const port = event.ports?.[0];
      if (message?.metadata?.SENDER !== SENDER || message == null || port == null) {
        return;
      }

      const abortController = new AbortController();
      port.onmessage = (event: MessageEvent<MessageWithMetadata>) => {
        if (event.data.type === MessageType.AbortRequest) {
          abortController.abort();
        }
      };

      try {
        const handlerResponse = await this.handler(message, abortController);
        const metadata: Metadata = { SENDER, requestId: message.metadata.requestId };
        port.postMessage({ ...handlerResponse, metadata });
      } catch (error) {
        const metadata: Metadata = { SENDER, requestId: message.metadata.requestId };
        port.postMessage({
          type: MessageType.ErrorResponse,
          metadata,
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      } finally {
        port.close();
      }
    });
  }

  async request(request: Message, abortController?: AbortController): Promise<Message> {
    const requestId = Date.now().toString();
    const metadata: Metadata = { SENDER, requestId };

    const requestChannel = new MessageChannel();
    const { port1: localPort, port2: remotePort } = requestChannel;

    const promise = new Promise<Message>((resolve) => {
      localPort.onmessage = (event: MessageEvent<MessageWithMetadata>) => resolve(event.data);
    });

    const abortListener = () =>
      localPort.postMessage({
        metadata: { SENDER, requestId: `${requestId}-abort` },
        type: MessageType.AbortRequest,
        abortedRequestId: requestId,
      });
    abortController?.signal.addEventListener("abort", abortListener);

    this.broadcastChannel.postMessage({ ...request, metadata }, remotePort);
    const response = await promise;

    abortController?.signal.removeEventListener("abort", abortListener);

    if (response.type === MessageType.ErrorResponse) {
      const error = new Error();
      Object.assign(error, JSON.parse(response.error));
      throw error;
    }

    return response;
  }
}
