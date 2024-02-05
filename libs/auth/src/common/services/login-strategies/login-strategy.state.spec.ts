import { PasswordTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/sso-token.request";
import { UserApiTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/user-api-token.request";
import { WebAuthnLoginTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/webauthn-login-token.request";
import { WebAuthnLoginAssertionResponseRequest } from "@bitwarden/common/auth/services/webauthn-login/request/webauthn-login-assertion-response.request";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { MasterKey, PrfKey, UserKey } from "@bitwarden/common/types/key";

import { AuthRequestLoginStrategyData } from "../../login-strategies/auth-request-login.strategy";
import { LoginStrategyData } from "../../login-strategies/login.strategy";
import { PasswordLoginStrategyData } from "../../login-strategies/password-login.strategy";
import { SsoLoginStrategyData } from "../../login-strategies/sso-login.strategy";
import { UserApiLoginStrategyData } from "../../login-strategies/user-api-login.strategy";
import { WebAuthnLoginStrategyData } from "../../login-strategies/webauthn-login.strategy";
import {
  MockAuthenticatorAssertionResponse,
  MockPublicKeyCredential,
} from "../../login-strategies/webauthn-login.strategy.spec";
import { AuthRequestLoginCredentials, WebAuthnLoginCredentials } from "../../models";

import { LOGIN_STRATEGY_CACHE_KEY } from "./login-strategy.state";

describe("LOGIN_STRATEGY_CACHE_KEY", () => {
  const sut = LOGIN_STRATEGY_CACHE_KEY;

  it("should correctly deserialize PasswordLoginStrategyData", () => {
    const data = new PasswordLoginStrategyData();
    data.tokenRequest = new PasswordTokenRequest(
      "EMAIL",
      "LOCAL_PASSWORD_HASH",
      "CAPTCHA_TOKEN",
      null,
    );
    data.masterKey = new SymmetricCryptoKey(new Uint8Array(64)) as MasterKey;

    const result = sut.deserializer(JSON.parse(JSON.stringify(data)));

    expect(result).toBeInstanceOf(PasswordLoginStrategyData);
    verifyPropertyPrototypes(data, result);
  });

  it("should correctly deserialize SsoLoginStrategyData", () => {
    const data = new SsoLoginStrategyData();
    data.tokenRequest = new SsoTokenRequest("CODE", "CODE_VERIFIER", "REDIRECT_URI", null);

    const result = sut.deserializer(JSON.parse(JSON.stringify(data)));

    expect(result).toBeInstanceOf(SsoLoginStrategyData);
    verifyPropertyPrototypes(data, result);
  });

  it("should correctly deserialize UserApiLoginStrategyData", () => {
    const data = new UserApiLoginStrategyData();
    data.tokenRequest = new UserApiTokenRequest("CLIENT_ID", "CLIENT_SECRET", null);

    const result = sut.deserializer(JSON.parse(JSON.stringify(data)));

    expect(result).toBeInstanceOf(UserApiLoginStrategyData);
    verifyPropertyPrototypes(data, result);
  });

  it("should correctly deserialize AuthRequestLoginStrategyData", () => {
    const data = new AuthRequestLoginStrategyData();
    data.tokenRequest = new PasswordTokenRequest("EMAIL", "ACCESS_CODE", null, null);
    data.authRequestCredentials = new AuthRequestLoginCredentials(
      "EMAIL",
      "ACCESS_CODE",
      "AUTH_REQUEST_ID",
      new SymmetricCryptoKey(new Uint8Array(64)) as UserKey,
      new SymmetricCryptoKey(new Uint8Array(64)) as MasterKey,
      "MASTER_KEY_HASH",
    );

    const result = sut.deserializer(JSON.parse(JSON.stringify(data)));

    expect(result).toBeInstanceOf(AuthRequestLoginStrategyData);
    verifyPropertyPrototypes(data, result);
  });

  it("should correctly deserialize WebAuthnLoginStrategyData", () => {
    global.AuthenticatorAssertionResponse = MockAuthenticatorAssertionResponse;
    const data = new WebAuthnLoginStrategyData();
    const publicKeyCredential = new MockPublicKeyCredential();
    const deviceResponse = new WebAuthnLoginAssertionResponseRequest(publicKeyCredential);
    const prfKey = new SymmetricCryptoKey(new Uint8Array(64)) as PrfKey;
    data.credentials = new WebAuthnLoginCredentials("TOKEN", deviceResponse, prfKey);
    data.tokenRequest = new WebAuthnLoginTokenRequest("TOKEN", deviceResponse, null);

    const result = sut.deserializer(JSON.parse(JSON.stringify(data)));

    expect(result).toBeInstanceOf(WebAuthnLoginStrategyData);
    verifyPropertyPrototypes(data, result);
  });
});

function verifyPropertyPrototypes<T extends LoginStrategyData>(data: T, result: T) {
  for (const key of Object.keys(data)) {
    const val = (result as any)[key];
    if (val === undefined) {
      fail("Expected value to be defined");
    }
    if (typeof val === "number") {
      // jest can't do instanceof with numbers
      // and we really only care about objects here
      continue;
    }
    const proto = Object.getPrototypeOf((data as any)[key]);
    expect(val).toBeInstanceOf(proto.constructor);
  }
}
