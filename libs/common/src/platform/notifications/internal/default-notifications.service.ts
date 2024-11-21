import {
  BehaviorSubject,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  mergeMap,
  Observable,
  switchMap,
} from "rxjs";

import { LogoutReason } from "@bitwarden/auth/common";

import { AccountService } from "../../../auth/abstractions/account.service";
import { AuthService } from "../../../auth/abstractions/auth.service";
import { AuthenticationStatus } from "../../../auth/enums/authentication-status";
import { NotificationType } from "../../../enums";
import {
  NotificationResponse,
  SyncCipherNotification,
  SyncFolderNotification,
  SyncSendNotification,
} from "../../../models/response/notification.response";
import { UserId } from "../../../types/guid";
import { SyncService } from "../../../vault/abstractions/sync/sync.service.abstraction";
import { AppIdService } from "../../abstractions/app-id.service";
import { EnvironmentService } from "../../abstractions/environment.service";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { supportSwitch } from "../../misc/support-status";
import { NotificationsService as NotificationsServiceAbstraction } from "../notifications.service";

import { SignalRConnectionService } from "./signalr-connection.service";
import { WebPushConnectionService } from "./webpush-connection.service";

export const DISABLED_NOTIFICATIONS_URL = "http://-";

export class DefaultNotificationsService implements NotificationsServiceAbstraction {
  notifications$: Observable<readonly [NotificationResponse, UserId]>;

  private activitySubject = new BehaviorSubject<"active" | "inactive">("active");

  constructor(
    private syncService: SyncService,
    private appIdService: AppIdService,
    private environmentService: EnvironmentService,
    private logoutCallback: (logoutReason: LogoutReason, userId: UserId) => Promise<void>,
    private messagingService: MessagingService,
    private readonly accountService: AccountService,
    private readonly signalRConnectionService: SignalRConnectionService,
    private readonly authService: AuthService,
    private readonly webPushConnectionService: WebPushConnectionService,
    private readonly logService: LogService,
  ) {
    this.notifications$ = this.accountService.activeAccount$.pipe(
      map((account) => account?.id),
      distinctUntilChanged(),
      switchMap((activeAccountId) => {
        if (activeAccountId == null) {
          // We don't emit notifications for inactive accounts currently
          return EMPTY;
        }

        return this.userNotifications$(activeAccountId).pipe(
          map((notification) => [notification, activeAccountId] as const),
        );
      }),
    );
  }

  /**
   * Retrieves a stream of push notifications for the given user.
   * @param userId The user id of the user to get the push notifications for.
   */
  private userNotifications$(userId: UserId) {
    return this.environmentService.environment$.pipe(
      map((env) => env.getNotificationsUrl()),
      distinctUntilChanged(),
      switchMap((notificationsUrl) => {
        if (notificationsUrl === DISABLED_NOTIFICATIONS_URL) {
          return EMPTY;
        }

        return this.userNotificationsHelper$(userId, notificationsUrl);
      }),
    );
  }

  private userNotificationsHelper$(userId: UserId, notificationsUrl: string) {
    return this.hasAccessToken$(userId).pipe(
      switchMap((hasAccessToken) => {
        if (!hasAccessToken) {
          return EMPTY;
        }

        return this.activitySubject;
      }),
      switchMap((activityStatus) => {
        if (activityStatus === "inactive") {
          return EMPTY;
        }

        return this.webPushConnectionService.supportStatus$(userId);
      }),
      supportSwitch({
        supported: (service) => service.notifications$,
        notSupported: () =>
          this.signalRConnectionService.connect$(userId, notificationsUrl).pipe(
            filter((n) => n.type === "ReceiveMessage"),
            map((n) => n.message),
          ),
      }),
    );
  }

  private hasAccessToken$(userId: UserId) {
    return this.authService.authStatusFor$(userId).pipe(
      map(
        (authStatus) =>
          authStatus === AuthenticationStatus.Locked ||
          authStatus === AuthenticationStatus.Unlocked,
      ),
      distinctUntilChanged(),
    );
  }

  private async processNotification(notification: NotificationResponse, userId: UserId) {
    const appId = await this.appIdService.getAppId();
    if (notification == null || notification.contextId === appId) {
      return;
    }

    const payloadUserId = notification.payload?.userId || notification.payload?.UserId;
    if (payloadUserId != null && payloadUserId !== userId) {
      return;
    }

    switch (notification.type) {
      case NotificationType.SyncCipherCreate:
      case NotificationType.SyncCipherUpdate:
        await this.syncService.syncUpsertCipher(
          notification.payload as SyncCipherNotification,
          notification.type === NotificationType.SyncCipherUpdate,
        );
        break;
      case NotificationType.SyncCipherDelete:
      case NotificationType.SyncLoginDelete:
        await this.syncService.syncDeleteCipher(notification.payload as SyncCipherNotification);
        break;
      case NotificationType.SyncFolderCreate:
      case NotificationType.SyncFolderUpdate:
        await this.syncService.syncUpsertFolder(
          notification.payload as SyncFolderNotification,
          notification.type === NotificationType.SyncFolderUpdate,
        );
        break;
      case NotificationType.SyncFolderDelete:
        await this.syncService.syncDeleteFolder(notification.payload as SyncFolderNotification);
        break;
      case NotificationType.SyncVault:
      case NotificationType.SyncCiphers:
      case NotificationType.SyncSettings:
        await this.syncService.fullSync(false);

        break;
      case NotificationType.SyncOrganizations:
        // An organization update may not have bumped the user's account revision date, so force a sync
        await this.syncService.fullSync(true);
        break;
      case NotificationType.SyncOrgKeys:
        await this.syncService.fullSync(true);
        this.activitySubject.next("inactive"); // Force a disconnect
        this.activitySubject.next("active"); // Allow a reconnect
        break;
      case NotificationType.LogOut:
        this.logService.info("[Notifications Service] Received logout notification");
        await this.logoutCallback("logoutNotification", userId);
        break;
      case NotificationType.SyncSendCreate:
      case NotificationType.SyncSendUpdate:
        await this.syncService.syncUpsertSend(
          notification.payload as SyncSendNotification,
          notification.type === NotificationType.SyncSendUpdate,
        );
        break;
      case NotificationType.SyncSendDelete:
        await this.syncService.syncDeleteSend(notification.payload as SyncSendNotification);
        break;
      case NotificationType.AuthRequest:
        {
          this.messagingService.send("openLoginApproval", {
            notificationId: notification.payload.id,
          });
        }
        break;
      default:
        break;
    }
  }

  startListening() {
    return this.notifications$
      .pipe(
        mergeMap(async ([notification, userId]) => this.processNotification(notification, userId)),
      )
      .subscribe({
        error: (e: unknown) => this.logService.warning("Error in notifications$ observable", e),
      });
  }

  reconnectFromActivity(): void {
    this.activitySubject.next("active");
  }

  disconnectFromInactivity(): void {
    this.activitySubject.next("inactive");
  }
}
