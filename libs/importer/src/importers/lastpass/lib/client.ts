import { HttpStatusCode } from "@bitwarden/common/enums";

import { Account } from "./account";
import { ClientInfo } from "./clientInfo";
import { ParserOptions } from "./parserOptions";
import { Platform } from "./platform";
import { RestClient } from "./restClient";
import { Session } from "./session";

enum OtpMethod {
  GoogleAuth,
  MicrosoftAuth,
  Yubikey,
}

const PlatformToUserAgent = new Map<Platform, string>([
  [Platform.Desktop, "cli"],
  [Platform.Mobile, "android"],
]);

const KnownOtpMethods = new Map<string, OtpMethod>([
  ["googleauthrequired", OtpMethod.GoogleAuth],
  ["microsoftauthrequired", OtpMethod.MicrosoftAuth],
  ["otprequired", OtpMethod.Yubikey],
]);

export class Client {
  openVault(
    username: string,
    password: string,
    clientInfo: ClientInfo,
    ui: any,
    parserOptions: ParserOptions
  ): Account[] {
    // TODO: ui type
    // const lowercaseUsername = username.toLowerCase();
    // TODO: login, download, parse etc...
    // TODO: logout
    return null;
  }

  private async login(
    username: string,
    password: string,
    clientInfo: ClientInfo,
    ui: any
  ): Promise<[Session, RestClient]> {
    // TODO: ui type
    const rest = new RestClient();
    rest.baseServerUrl = "https://lastpass.com";
    /*
        1. First we need to request PBKDF2 key iteration count.
        
        We no longer request the iteration count from the server in a separate request because it
        started to fail in weird ways. It seems there's a special combination or the UA and cookies
        that returns the correct result. And that is not 100% reliable. After two or three attempts
        it starts to fail again with an incorrect result.
        
        So we just went back a few years to the original way LastPass used to handle the iterations.
        Namely, submit the default value and if it fails, the error would contain the correct value:
        <response><error iterations="5000" /></response>
        */
    let keyIterationCount = 100_100;

    let response: Document = null;
    let session: Session = null;

    // We have a maximum of 3 retries in case we need to try again with the correct domain and/or
    // the number of KDF iterations the second/third time around.
    for (let i = 0; i < 3; i++) {
      // 2. Knowing the iterations count we can hash the password and log in.
      // On the first attempt simply with the username and password.
      response = await this.performSingleLoginRequest(
        username,
        password,
        keyIterationCount,
        new Map<string, any>(),
        clientInfo,
        rest
      );

      session = this.extractSessionFromLoginResponse(response, keyIterationCount, clientInfo);
      if (session != null) {
        return [session, rest];
      }

      // It's possible we're being redirected to another region.
      const server = this.getOptionalErrorAttribute(response, "server");
      if (server != null && server.trim() != "") {
        rest.baseServerUrl = "https://" + server;
        continue;
      }

      // It's possible for the request above to come back with the correct iteration count.
      // In this case we have to parse and repeat.
      const correctIterationCount = this.getOptionalErrorAttribute(response, "iterations");
      if (correctIterationCount == null) {
        break;
      }

      try {
        keyIterationCount = parseInt(correctIterationCount);
      } catch {
        throw (
          "Failed to parse the iteration count, expected an integer value '" +
          correctIterationCount +
          "'"
        );
      }
    }

    // 3. The simple login failed. This is usually due to some error, invalid credentials or
    // a multifactor authentication being enabled.
    const cause = this.getOptionalErrorAttribute(response, "cause");
    if (cause == null) {
      throw this.makeLoginError(response);
    }

    // 3.1. One-time-password is required
    const optMethod = KnownOtpMethods.get(cause);
    if (optMethod != null) {
      // TODO
      session = null;
    } else if (cause === "outofbandrequired") {
      // 3.2. Some out-of-bound authentication is enabled. This does not require any
      // additional input from the user.

      // TODO
      session = null;
    }

    // Nothing worked
    if (session == null) {
      throw this.makeLoginError(response);
    }

    // All good
    return [session, rest];
  }

  private getOptionalErrorAttribute(response: Document, name: string): string {
    const error = response.querySelector("response > error");
    if (error == null) {
      return null;
    }
    const attr = error.attributes.getNamedItem(name);
    if (attr == null) {
      return null;
    }
    return attr.value;
  }

  private extractSessionFromLoginResponse(
    response: Document,
    keyIterationCount: number,
    clientInfo: ClientInfo
  ): Session {
    const ok = response.querySelector("response > ok");
    if (ok == null) {
      return null;
    }
    const sessionId = ok.attributes.getNamedItem("sessionid");
    if (sessionId == null) {
      return null;
    }
    const token = ok.attributes.getNamedItem("token");
    if (token == null) {
      return null;
    }

    const session = new Session();
    session.id = sessionId.value;
    session.keyIterationCount = keyIterationCount;
    session.token = token.value;
    session.platform = clientInfo.platform;
    const privateKey = ok.attributes.getNamedItem("privatekeyenc");
    if (privateKey != null && privateKey.value != null && privateKey.value.trim() != "") {
      session.encryptedPrivateKey = privateKey.value;
    }

    return session;
  }

  private async performSingleLoginRequest(
    username: string,
    password: string,
    keyIterationCount: number,
    extraParameters: Map<string, any>,
    clientInfo: ClientInfo,
    rest: RestClient
  ) {
    const parameters = new Map<string, any>([
      ["method", PlatformToUserAgent.get(clientInfo.platform)],
      ["xml", "2"],
      ["username", ""],
      ["hash", ""],
      ["iterations", ""],
      ["includeprivatekeyenc", "1"],
      ["outofbandsupported", "1"],
      ["uuid", clientInfo.id],
      // TODO: Test against the real server if it's ok to send this every time!
      ["trustlabel", clientInfo.description],
    ]);
    for (const [key, value] of extraParameters) {
      parameters.set(key, value);
    }

    const form = new FormData();
    for (const [key, value] of parameters) {
      form.set(key, value);
    }
    const requestInit: RequestInit = {
      method: "POST",
      body: form,
    };
    const request = new Request(rest.baseServerUrl + "/login.php", requestInit);
    const response = await fetch(request);

    // const responseType = response.headers.get("content-type");
    // const responseIsJson = responseType != null && responseType.indexOf("application/json") !== -1;
    // const responseIsXml = responseType != null && responseType.indexOf("application/xml") !== -1;
    if (response.status == HttpStatusCode.Ok) {
      const text = await response.text();
      const domParser = new window.DOMParser();
      return domParser.parseFromString(text, "text/xml");
    }
    this.makeError(response);
  }

  private makeError(response: Response) {
    // TODO: error parsing
    throw "HTTP request to " + response.url + " failed with status " + response.status + ".";
  }

  private makeLoginError(response: Document): string {
    const error = response.querySelector("response > error");
    if (error == null) {
      return "Unknown response schema";
    }

    const cause = error.attributes.getNamedItem("cause");
    const message = error.attributes.getNamedItem("message");

    if (cause != null) {
      switch (cause.value) {
        case "unknownemail":
          return "Invalid username";
        case "unknownpassword":
          return "Invalid password";
        case "googleauthfailed":
        case "microsoftauthfailed":
        case "otpfailed":
          return "Second factor code is incorrect";
        case "multifactorresponsefailed":
          return "Out of band authentication failed";
        default:
          return message?.value ?? cause.value;
      }
    }

    // No cause, maybe at least a message
    if (message != null) {
      return message.value;
    }

    // Nothing we know, just the error element
    return "Unknown error";
  }
}
