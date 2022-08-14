import Deferred from "./deferred";

type NativeMessage = {
  messageId: string;
  payload: {};
};

type NativeMessageResponse = {
  messageId: string;
  payload: {};
};

export default class NativeMessageService {
  private pendingMessages = new Map<string, Deferred<NativeMessageResponse>>();

  public sendMessage(message: NativeMessage): Promise<NativeMessageResponse> {
    if (this.pendingMessages.has(message.messageId)) {
      throw new Error("You already sent this message, dum dum");
    }

    const deferred = new Deferred<NativeMessageResponse>();

    this.pendingMessages.set(message.messageId, deferred);

    return deferred.getPromise();
  }

  //   someOtherFunction() {
  //     this.ipc.onMessage((message) => {
  //       if (this.pendingMessages.has(message.messageId)) {
  //         const deferred = this.pendingMessages.get(message.messageId);

  //         deferred.resolve(message);
  //       }
  //     });
  //   }
}
