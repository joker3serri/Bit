import { map, Observable } from "rxjs";

import {
  USER_NOTIFICATION_SETTINGS_DISK,
  GlobalState,
  KeyDefinition,
  StateProvider,
} from "../../platform/state";

const ENABLE_ADDED_LOGIN_PROMPT = new KeyDefinition(
  USER_NOTIFICATION_SETTINGS_DISK,
  "enableAddedLoginPrompt",
  {
    deserializer: (value: boolean) => value ?? true,
  },
);
const ENABLE_CHANGED_PASSWORD_PROMPT = new KeyDefinition(
  USER_NOTIFICATION_SETTINGS_DISK,
  "enableChangedPasswordPrompt",
  {
    deserializer: (value: boolean) => value ?? true,
  },
);
const ENABLE_EXPIRED_PAYMENT_CIPHER_WARNING = new KeyDefinition(
  USER_NOTIFICATION_SETTINGS_DISK,
  "enableExpiredPaymentCipherWarning",
  {
    deserializer: (value: boolean) => value ?? true,
  },
);

export abstract class UserNotificationSettingsServiceAbstraction {
  enableAddedLoginPrompt$: Observable<boolean>;
  setEnableAddedLoginPrompt: (newValue: boolean) => Promise<void>;
  enableChangedPasswordPrompt$: Observable<boolean>;
  setEnableChangedPasswordPrompt: (newValue: boolean) => Promise<void>;
  enableExpiredPaymentCipherWarning$: Observable<boolean>;
  setEnableExpiredPaymentCipherWarning: (newValue: boolean) => Promise<void>;
}

export class UserNotificationSettingsService implements UserNotificationSettingsServiceAbstraction {
  private enableAddedLoginPromptState: GlobalState<boolean>;
  readonly enableAddedLoginPrompt$: Observable<boolean>;

  private enableChangedPasswordPromptState: GlobalState<boolean>;
  readonly enableChangedPasswordPrompt$: Observable<boolean>;

  private enableExpiredPaymentCipherWarningState: GlobalState<boolean>;
  readonly enableExpiredPaymentCipherWarning$: Observable<boolean>;

  constructor(private stateProvider: StateProvider) {
    this.enableAddedLoginPromptState = this.stateProvider.getGlobal(ENABLE_ADDED_LOGIN_PROMPT);
    this.enableAddedLoginPrompt$ = this.enableAddedLoginPromptState.state$.pipe(
      map((x) => x ?? true),
    );

    this.enableChangedPasswordPromptState = this.stateProvider.getGlobal(
      ENABLE_CHANGED_PASSWORD_PROMPT,
    );
    this.enableChangedPasswordPrompt$ = this.enableChangedPasswordPromptState.state$.pipe(
      map((x) => x ?? true),
    );

    this.enableExpiredPaymentCipherWarningState = this.stateProvider.getGlobal(
      ENABLE_EXPIRED_PAYMENT_CIPHER_WARNING,
    );
    this.enableExpiredPaymentCipherWarning$ =
      this.enableExpiredPaymentCipherWarningState.state$.pipe(map((x) => x ?? true));
  }

  async setEnableAddedLoginPrompt(newValue: boolean): Promise<void> {
    await this.enableAddedLoginPromptState.update(() => newValue);
  }

  async setEnableChangedPasswordPrompt(newValue: boolean): Promise<void> {
    await this.enableChangedPasswordPromptState.update(() => newValue);
  }

  async setEnableExpiredPaymentCipherWarning(newValue: boolean): Promise<void> {
    await this.enableExpiredPaymentCipherWarningState.update(() => newValue);
  }
}
