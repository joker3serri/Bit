// @ts-strict-ignore
export abstract class MessagingService {
  send: (subscriber: string, arg?: any) => void;
}
