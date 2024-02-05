import { AuthenticationType } from "@bitwarden/common/auth/enums/authentication-type";
import { KeyDefinition, LOGIN_STRATEGY_MEMORY } from "@bitwarden/common/platform/state";

import { AuthRequestLoginStrategyData } from "../../login-strategies/auth-request-login.strategy";
import { PasswordLoginStrategyData } from "../../login-strategies/password-login.strategy";
import { SsoLoginStrategyData } from "../../login-strategies/sso-login.strategy";
import { UserApiLoginStrategyData } from "../../login-strategies/user-api-login.strategy";
import { WebAuthnLoginStrategyData } from "../../login-strategies/webauthn-login.strategy";

export type DataTypes =
  | PasswordLoginStrategyData
  | SsoLoginStrategyData
  | UserApiLoginStrategyData
  | AuthRequestLoginStrategyData
  | WebAuthnLoginStrategyData;

/**
 * The current login strategy in use.
 */
export const CURRENT_LOGIN_STRATEGY_KEY = new KeyDefinition<AuthenticationType | null>(
  LOGIN_STRATEGY_MEMORY,
  "currentLoginStrategy",
  {
    deserializer: (data) => data,
  },
);

/**
 * A cache for login strategies to use for data persistence through
 * the login process.
 */
export const LOGIN_STRATEGY_CACHE_KEY = new KeyDefinition<DataTypes | null>(
  LOGIN_STRATEGY_MEMORY,
  "loginStrategyCache",
  {
    deserializer: (data) => {
      if (data == null) {
        return null;
      }
      switch (data.type) {
        case AuthenticationType.Password:
          return PasswordLoginStrategyData.fromJSON(data);
        case AuthenticationType.Sso:
          return SsoLoginStrategyData.fromJSON(data);
        case AuthenticationType.UserApi:
          return UserApiLoginStrategyData.fromJSON(data);
        case AuthenticationType.AuthRequest:
          return AuthRequestLoginStrategyData.fromJSON(data);
        case AuthenticationType.WebAuthn:
          return WebAuthnLoginStrategyData.fromJSON(data);
      }
    },
  },
);

/**
 * The expiration date for the login strategy cache.
 * Used as a backup to the timer set on the service.
 */
export const LOGIN_STRATEGY_CACHE_EXPIRATION = new KeyDefinition<Date | null>(
  LOGIN_STRATEGY_MEMORY,
  "loginStrategyCacheExpiration",
  {
    deserializer: (data) => (data ? null : new Date(data)),
  },
);

/**
 * Auth Request notification for all instances of the login strategy service.
 * Note: this isn't an ideal approach, but allows both a background and
 * foreground instance to send out the notification.
 * TODO: Move to Auth Request service.
 */
export const AUTH_REQUEST_PUSH_NOTIFICATION = new KeyDefinition<string>(
  LOGIN_STRATEGY_MEMORY,
  "authRequestPushNotification",
  {
    deserializer: (data) => data,
  },
);
