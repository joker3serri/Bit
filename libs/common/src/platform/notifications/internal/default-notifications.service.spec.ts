import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, bufferCount, firstValueFrom, ObservedValueOf, Subject } from "rxjs";

import { LogoutReason } from "@bitwarden/auth/common";

import { awaitAsync } from "../../../../spec";
import { Matrix } from "../../../../spec/matrix";
import { AccountService } from "../../../auth/abstractions/account.service";
import { AuthService } from "../../../auth/abstractions/auth.service";
import { AuthenticationStatus } from "../../../auth/enums/authentication-status";
import { NotificationType } from "../../../enums";
import { NotificationResponse } from "../../../models/response/notification.response";
import { UserId } from "../../../types/guid";
import { AppIdService } from "../../abstractions/app-id.service";
import { Environment, EnvironmentService } from "../../abstractions/environment.service";
import { LogService } from "../../abstractions/log.service";
import { MessageSender } from "../../messaging";
import { SupportStatus } from "../../misc/support-status";
import { SyncService } from "../../sync";

import {
  DefaultNotificationsService,
  DISABLED_NOTIFICATIONS_URL,
} from "./default-notifications.service";
import { SignalRNotification, SignalRConnectionService } from "./signalr-connection.service";
import { WebPushConnectionService, WebPushConnector } from "./webpush-connection.service";
import { WorkerWebPushConnectionService } from "./worker-webpush-connection.service";

describe("NotificationsService", () => {
  let syncService: MockProxy<SyncService>;
  let appIdService: MockProxy<AppIdService>;
  let environmentService: MockProxy<EnvironmentService>;
  let logoutCallback: jest.Mock<Promise<void>, [logoutReason: LogoutReason]>;
  let messagingService: MockProxy<MessageSender>;
  let accountService: MockProxy<AccountService>;
  let signalRNotificationConnectionService: MockProxy<SignalRConnectionService>;
  let authService: MockProxy<AuthService>;
  let webPushNotificationConnectionService: MockProxy<WebPushConnectionService>;

  let activeAccount: BehaviorSubject<ObservedValueOf<AccountService["activeAccount$"]>>;

  let environment: BehaviorSubject<ObservedValueOf<EnvironmentService["environment$"]>>;

  let authStatusGetter: (userId: UserId) => BehaviorSubject<AuthenticationStatus>;

  let webPushSupportGetter: (userId: UserId) => BehaviorSubject<SupportStatus<WebPushConnector>>;

  let signalrNotificationGetter: (
    userId: UserId,
    notificationsUrl: string,
  ) => Subject<SignalRNotification>;

  let sut: DefaultNotificationsService;

  beforeEach(() => {
    syncService = mock<SyncService>();
    appIdService = mock<AppIdService>();
    environmentService = mock<EnvironmentService>();
    logoutCallback = jest.fn<Promise<void>, [logoutReason: LogoutReason]>();
    messagingService = mock<MessageSender>();
    accountService = mock<AccountService>();
    signalRNotificationConnectionService = mock<SignalRConnectionService>();
    authService = mock<AuthService>();
    webPushNotificationConnectionService = mock<WorkerWebPushConnectionService>();

    activeAccount = new BehaviorSubject<ObservedValueOf<AccountService["activeAccount$"]>>(null);
    accountService.activeAccount$ = activeAccount.asObservable();

    environment = new BehaviorSubject<ObservedValueOf<EnvironmentService["environment$"]>>({
      getNotificationsUrl: () => "https://notifications.bitwarden.com",
    } as Environment);

    environmentService.environment$ = environment;

    authStatusGetter = Matrix.autoMockMethod(
      authService.authStatusFor$,
      () => new BehaviorSubject<AuthenticationStatus>(AuthenticationStatus.LoggedOut),
    );

    webPushSupportGetter = Matrix.autoMockMethod(
      webPushNotificationConnectionService.supportStatus$,
      () =>
        new BehaviorSubject<SupportStatus<WebPushConnector>>({
          type: "not-supported",
          reason: "test",
        }),
    );

    signalrNotificationGetter = Matrix.autoMockMethod(
      signalRNotificationConnectionService.connect$,
      () => new Subject<SignalRNotification>(),
    );

    sut = new DefaultNotificationsService(
      syncService,
      appIdService,
      environmentService,
      logoutCallback,
      messagingService,
      accountService,
      signalRNotificationConnectionService,
      authService,
      webPushNotificationConnectionService,
      mock<LogService>(),
    );
  });

  const mockUser1 = "user1" as UserId;
  const mockUser2 = "user2" as UserId;

  function emitActiveUser(userId: UserId) {
    if (userId == null) {
      activeAccount.next(null);
    } else {
      activeAccount.next({ id: userId, email: "email", name: "Test Name", emailVerified: true });
    }
  }

  function emitNotificationUrl(url: string) {
    environment.next({
      getNotificationsUrl: () => url,
    } as Environment);
  }

  const expectNotification = (
    notification: readonly [NotificationResponse, UserId],
    expectedUser: UserId,
    expectedType: NotificationType,
  ) => {
    const [actualNotification, actualUser] = notification;
    expect(actualUser).toBe(expectedUser);
    expect(actualNotification.type).toBe(expectedType);
  };

  it("emits notifications through WebPush when supported", async () => {
    const notificationsPromise = firstValueFrom(sut.notifications$.pipe(bufferCount(2)));

    emitActiveUser(mockUser1);
    emitNotificationUrl("http://test.example.com");
    authStatusGetter(mockUser1).next(AuthenticationStatus.Unlocked);

    const webPush = mock<WebPushConnector>();
    const webPushSubject = new Subject<NotificationResponse>();
    webPush.notifications$ = webPushSubject;

    webPushSupportGetter(mockUser1).next({ type: "supported", service: webPush });
    webPushSubject.next(new NotificationResponse({ type: NotificationType.SyncFolderCreate }));
    webPushSubject.next(new NotificationResponse({ type: NotificationType.SyncFolderDelete }));

    const notifications = await notificationsPromise;
    expectNotification(notifications[0], mockUser1, NotificationType.SyncFolderCreate);
    expectNotification(notifications[1], mockUser1, NotificationType.SyncFolderDelete);
  });

  test("observable chain reacts to inputs properly", async () => {
    // Sets up two active unlocked user, one pointing to an environment with WebPush, the other
    // falling back to using SignalR

    // We start with one active user with an unlocked account that
    emitActiveUser(mockUser1);
    emitNotificationUrl("http://test.example.com");
    authStatusGetter(mockUser1).next(AuthenticationStatus.Unlocked);
    const webPush = mock<WebPushConnector>();
    const webPushSubject = new Subject<NotificationResponse>();
    webPush.notifications$ = webPushSubject;

    // Start listening to notifications
    const notificationsPromise = firstValueFrom(sut.notifications$.pipe(bufferCount(4)));

    // Pretend web push becomes supported
    webPushSupportGetter(mockUser1).next({ type: "supported", service: webPush });

    // Emit a couple notifications through WebPush
    webPushSubject.next(new NotificationResponse({ type: NotificationType.LogOut }));
    webPushSubject.next(new NotificationResponse({ type: NotificationType.SyncCipherCreate }));

    // Switch to having no active user
    emitActiveUser(null);

    // Switch to another user
    emitActiveUser(mockUser2);

    // User unlocks
    authStatusGetter(mockUser2).next(AuthenticationStatus.Unlocked);

    // Web push is not supported for second user
    webPushSupportGetter(mockUser2).next({ type: "not-supported", reason: "test" });

    // They should connect and receive notifications from signalR
    signalrNotificationGetter(mockUser2, "http://test.example.com").next({
      type: "ReceiveMessage",
      message: new NotificationResponse({ type: NotificationType.SyncCipherUpdate }),
    });

    // Heartbeats should be ignored.
    signalrNotificationGetter(mockUser2, "http://test.example.com").next({
      type: "Heartbeat",
    });

    // User could turn off notifications (this would generally happen while there is no active user)
    emitNotificationUrl("http://-");

    // Since notifications are shut down by this url, this notification shouldn't be read ever
    signalrNotificationGetter(mockUser2, "http://-").next({
      type: "ReceiveMessage",
      message: new NotificationResponse({ type: NotificationType.LogOut }),
    });

    // User could turn them back on
    emitNotificationUrl("http://test.example.com");

    // SignalR emits another notification
    signalrNotificationGetter(mockUser2, "http://test.example.com").next({
      type: "ReceiveMessage",
      message: new NotificationResponse({ type: NotificationType.SyncCipherDelete }),
    });

    const notifications = await notificationsPromise;

    expectNotification(notifications[0], mockUser1, NotificationType.LogOut);
    expectNotification(notifications[1], mockUser1, NotificationType.SyncCipherCreate);
    expectNotification(notifications[2], mockUser2, NotificationType.SyncCipherUpdate);
    expectNotification(notifications[3], mockUser2, NotificationType.SyncCipherDelete);
  });

  it("does not re-connect when the user transitions from locked to unlocked doesn't reconnect", async () => {
    emitActiveUser(mockUser1);
    emitNotificationUrl("http://test.example.com");
    authStatusGetter(mockUser1).next(AuthenticationStatus.Locked);
    webPushSupportGetter(mockUser1).next({ type: "not-supported", reason: "test" });

    const notificationsSubscriptions = sut.notifications$.subscribe();
    await awaitAsync(1);

    authStatusGetter(mockUser1).next(AuthenticationStatus.Unlocked);
    await awaitAsync(1);

    expect(signalRNotificationConnectionService.connect$).toHaveBeenCalledTimes(1);
    expect(signalRNotificationConnectionService.connect$).toHaveBeenCalledWith(
      mockUser1,
      "http://test.example.com",
    );
    notificationsSubscriptions.unsubscribe();
  });

  it("re-connects when a user transitions from ", () => {
    //
  });

  test("that a disabled notification stream does not connect to any notification stream", () => {
    emitActiveUser(mockUser1);
    emitNotificationUrl(DISABLED_NOTIFICATIONS_URL);

    expect(signalRNotificationConnectionService.connect$).not.toHaveBeenCalled();
    expect(webPushNotificationConnectionService.supportStatus$).not.toHaveBeenCalled();
  });
});
