import { NotificationsService as NotificationsServiceAbstraction } from "../../abstractions/notifications.service";

export class NoopNotificationsService implements NotificationsServiceAbstraction {
  init(): Promise<void> {
    return Promise.resolve();
  }
  updateConnection(sync?: boolean): Promise<void> {
    return Promise.resolve();
  }
  reconnectFromActivity(): Promise<void> {
    return Promise.resolve();
  }
  disconnectFromInactivity(): Promise<void> {
    return Promise.resolve();
  }
}
