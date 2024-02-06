import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { DeviceRequest } from "@bitwarden/common/auth/models/request/identity-token/device.request";
import { PasswordTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/sso-token.request";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/user-api-token.request";
import { WebAuthnLoginTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/webauthn-login-token.request";
import { WebAuthnLoginAssertionResponseRequest } from "@bitwarden/common/auth/services/webauthn-login/request/webauthn-login-assertion-response.request";
import { DeviceType } from "@bitwarden/common/enums";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { MasterKey, PrfKey, UserKey } from "@bitwarden/common/types/key";

import { AuthRequestLoginStrategyData } from "../../login-strategies/auth-request-login.strategy";
import { PasswordLoginStrategyData } from "../../login-strategies/password-login.strategy";
import { SsoLoginStrategyData } from "../../login-strategies/sso-login.strategy";
import { UserApiLoginStrategyData } from "../../login-strategies/user-api-login.strategy";
import { WebAuthnLoginStrategyData } from "../../login-strategies/webauthn-login.strategy";
import {
  MockAuthenticatorAssertionResponse,
  MockPublicKeyCredential,
} from "../../login-strategies/webauthn-login.strategy.spec";
import { AuthRequestLoginCredentials, WebAuthnLoginCredentials } from "../../models";

import { CACHE_KEY } from "./login-strategy.state";

describe("LOGIN_STRATEGY_CACHE_KEY", () => {
  const sut = CACHE_KEY;

  let deviceRequest: DeviceRequest;
  let twoFactorRequest: TokenTwoFactorRequest;

  beforeEach(() => {
    deviceRequest = Object.assign(Object.create(DeviceRequest.prototype), {
      type: DeviceType.ChromeBrowser,
      name: "DEVICE_NAME",
      identifier: "DEVICE_IDENTIFIER",
      pushToken: "PUSH_TOKEN",
    });

    twoFactorRequest = new TokenTwoFactorRequest(TwoFactorProviderType.Email, "TOKEN", false);
  });

  it("should correctly deserialize PasswordLoginStrategyData", () => {
    const actual = new PasswordLoginStrategyData();
    actual.tokenRequest = new PasswordTokenRequest(
      "EMAIL",
      "LOCAL_PASSWORD_HASH",
      "CAPTCHA_TOKEN",
      twoFactorRequest,
      deviceRequest,
    );
    actual.masterKey = new SymmetricCryptoKey(new Uint8Array(64)) as MasterKey;
    actual.localMasterKeyHash = "LOCAL_MASTER_KEY_HASH";

    const result = sut.deserializer(JSON.parse(JSON.stringify(actual)));

    expect(result).toBeInstanceOf(PasswordLoginStrategyData);
    verifyPropertyPrototypes(result, actual);
  });

  it("should correctly deserialize SsoLoginStrategyData", () => {
    const actual = new SsoLoginStrategyData();
    actual.tokenRequest = new SsoTokenRequest(
      "CODE",
      "CODE_VERIFIER",
      "REDIRECT_URI",
      twoFactorRequest,
      deviceRequest,
    );

    const result = sut.deserializer(JSON.parse(JSON.stringify(actual)));

    expect(result).toBeInstanceOf(SsoLoginStrategyData);
    verifyPropertyPrototypes(result, actual);
  });

  it("should correctly deserialize UserApiLoginStrategyData", () => {
    const actual = new UserApiLoginStrategyData();
    actual.tokenRequest = new UserApiTokenRequest("CLIENT_ID", "CLIENT_SECRET", null);

    const result = sut.deserializer(JSON.parse(JSON.stringify(actual)));

    expect(result).toBeInstanceOf(UserApiLoginStrategyData);
    verifyPropertyPrototypes(result, actual);
  });

  it("should correctly deserialize AuthRequestLoginStrategyData", () => {
    const actual = new AuthRequestLoginStrategyData();
    actual.tokenRequest = new PasswordTokenRequest("EMAIL", "ACCESS_CODE", null, null);
    actual.authRequestCredentials = new AuthRequestLoginCredentials(
      "EMAIL",
      "ACCESS_CODE",
      "AUTH_REQUEST_ID",
      new SymmetricCryptoKey(new Uint8Array(64)) as UserKey,
      new SymmetricCryptoKey(new Uint8Array(64)) as MasterKey,
      "MASTER_KEY_HASH",
    );

    const result = sut.deserializer(JSON.parse(JSON.stringify(actual)));

    expect(result).toBeInstanceOf(AuthRequestLoginStrategyData);
    verifyPropertyPrototypes(result, actual);
  });

  it("should correctly deserialize WebAuthnLoginStrategyData", () => {
    global.AuthenticatorAssertionResponse = MockAuthenticatorAssertionResponse;
    const actual = new WebAuthnLoginStrategyData();
    const publicKeyCredential = new MockPublicKeyCredential();
    const deviceResponse = new WebAuthnLoginAssertionResponseRequest(publicKeyCredential);
    const prfKey = new SymmetricCryptoKey(new Uint8Array(64)) as PrfKey;
    actual.credentials = new WebAuthnLoginCredentials("TOKEN", deviceResponse, prfKey);
    actual.tokenRequest = new WebAuthnLoginTokenRequest("TOKEN", deviceResponse, deviceRequest);
    actual.captchaBypassToken = "CAPTCHA_BYPASS_TOKEN";
    actual.tokenRequest.setTwoFactor(
      new TokenTwoFactorRequest(TwoFactorProviderType.Email, "TOKEN", false),
    );

    const result = sut.deserializer(JSON.parse(JSON.stringify(actual)));

    expect(result).toBeInstanceOf(WebAuthnLoginStrategyData);
    verifyPropertyPrototypes(result, actual);
  });
});

/**
 * Recursively verifies the prototypes of all objects in the deserialized object.
 * It is important that the concrete object has the correct prototypes for
 * comparison.
 * @param deserialized the deserialized object
 * @param concrete the object stored in state
 */
function verifyPropertyPrototypes(deserialized: object, concrete: object) {
  for (const key of Object.keys(deserialized)) {
    const deserializedProperty = (deserialized as any)[key];
    if (deserializedProperty === undefined) {
      continue;
    }
    const realProperty = (concrete as any)[key];
    if (realProperty === undefined) {
      throw new Error(`Expected ${key} to be defined in ${concrete.constructor.name}`);
    }
    // we only care about checking prototypes of objects
    if (typeof realProperty === "object" && realProperty !== null) {
      const realProto = Object.getPrototypeOf(realProperty);
      expect(deserializedProperty).toBeInstanceOf(realProto.constructor);
      verifyPropertyPrototypes(deserializedProperty, realProperty);
    }
  }
}
