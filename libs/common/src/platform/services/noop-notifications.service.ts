import { NotificationsService as NotificationsServiceAbstraction } from "../../abstractions/notifications.service";
import { LogService } from "../abstractions/log.service";

export class NoopNotificationsService implements NotificationsServiceAbstraction {
  constructor(private logService: LogService) {
    logService.debug("NoopNotificationsService");
  }

  init(): Promise<void> {
    this.logService.info("Initializing notification service");
    return Promise.resolve();
  }

  updateConnection(sync?: boolean): Promise<void> {
    this.logService.info("Updating notification service connection");
    return Promise.resolve();
  }

  reconnectFromActivity(): Promise<void> {
    this.logService.info("Reconnecting notification service from activity");
    return Promise.resolve();
  }

  disconnectFromInactivity(): Promise<void> {
    this.logService.info("Disconnecting notification service from inactivity");
    return Promise.resolve();
  }
}
