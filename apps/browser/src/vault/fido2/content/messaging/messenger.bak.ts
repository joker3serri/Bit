// import { concatMap, filter, firstValueFrom, Observable } from "rxjs";

import { Message, MessageType } from "./message";

const SENDER = "bitwarden-webauthn";

type PostMessageFunction = (message: MessageWithMetadata, remotePort: MessagePort) => void;

export type Channel = {
  // messages$: Observable<MessageWithMetadata>;
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
      // messages$: new Observable((subscriber) => {
      //   const eventListener = (event: MessageEvent<MessageWithMetadata>) => {
      //     if (event.origin !== windowOrigin) {
      //       return;
      //     }

      //     subscriber.next(event.data);
      //   };

      //   window.addEventListener("message", eventListener);

      //   return () => window.removeEventListener("message", eventListener);
      // }),
    });
  }

  handler?: Handler;
  private abortControllers = new Map<string, AbortController>();

  constructor(private broadcastChannel: Channel) {
    this.broadcastChannel.addEventListener(async (event) => {
      const abortController = new AbortController();
      const message = event.data;
      const port = event.ports[0];

      const handlerResponse = await this.handler(message, abortController);
      if (handlerResponse === undefined) {
        return;
      }

      const metadata: Metadata = { SENDER, requestId: message.metadata.requestId };
      port.postMessage({ ...handlerResponse, metadata });
    });

    // this.channel.messages$
    //   .pipe(
    //     filter((message) => message?.metadata?.SENDER === SENDER),
    //     concatMap(async (message) => {
    //       if (this.handler === undefined) {
    //         return;
    //       }
    //       const abortController = new AbortController();
    //       this.abortControllers.set(message.metadata.requestId, abortController);
    //       try {
    //         const handlerResponse = await this.handler(message, abortController);
    //         if (handlerResponse === undefined) {
    //           return;
    //         }
    //         const metadata: Metadata = { SENDER, requestId: message.metadata.requestId };
    //         this.channel.postMessage({ ...handlerResponse, metadata });
    //       } catch (error) {
    //         const metadata: Metadata = { SENDER, requestId: message.metadata.requestId };
    //         this.channel.postMessage({
    //           type: MessageType.ErrorResponse,
    //           metadata,
    //           error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    //         });
    //       } finally {
    //         this.abortControllers.delete(message.metadata.requestId);
    //       }
    //     })
    //   )
    //   .subscribe();
    // this.channel.messages$.subscribe((message) => {
    //   if (message.type !== MessageType.AbortRequest) {
    //     return;
    //   }
    //   this.abortControllers.get(message.abortedRequestId)?.abort();
    // });
  }

  async request(request: Message, abortController?: AbortController): Promise<Message> {
    const requestId = Date.now().toString();
    const metadata: Metadata = { SENDER, requestId };

    const requestChannel = new MessageChannel();
    const { port1: localPort, port2: remotePort } = requestChannel;

    const promise = new Promise<Message>((resolve) => {
      localPort.onmessage = (event: MessageEvent<MessageWithMetadata>) => resolve(event.data);
    });

    this.broadcastChannel.postMessage({ ...request, metadata }, remotePort);
    const response = await promise;

    if (response.type === MessageType.ErrorResponse) {
      const error = new Error();
      Object.assign(error, JSON.parse(response.error));
      throw error;
    }

    return response;

    // const promise = new Promise((resolve, reject) => {
    //   const eventListener = (event: MessageEvent<MessageWithMetadata>) => {
    //     const message = event.data;
    //     if (event.origin !== window.location.origin || message == null || message.metadata?.requestId !== requestId) {
    //       return;
    //     }

    //     resolve(message);
    //   };

    //   localPort.addEventListener("message", eventListener);
    // });
    // const promise = firstValueFrom(
    //   this.channel.messages$.pipe(
    //     filter(
    //       (m) => m != undefined && m.metadata?.requestId === requestId && m.type !== request.type
    //     )
    //   )
    // );

    // const abortListener = () =>
    //   this.channel.postMessage({
    //     metadata: { SENDER, requestId: `${requestId}-abort` },
    //     type: MessageType.AbortRequest,
    //     abortedRequestId: requestId,
    //   });
    // abortController?.signal.addEventListener("abort", abortListener);

    // this.channel.postMessage({ ...request, metadata }, remotePort);

    // const response = await promise;
    // abortController?.signal.removeEventListener("abort", abortListener);

    // if (response.type === MessageType.ErrorResponse) {
    //   const error = new Error();
    //   Object.assign(error, JSON.parse(response.error));
    //   throw error;
    // }

    // return response;
  }
}
