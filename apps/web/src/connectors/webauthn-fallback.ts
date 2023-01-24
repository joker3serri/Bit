// eslint-disable-next-line no-restricted-imports
import { I18nService } from "../app/core/i18n.service";

import { b64Decode, getQsParam } from "./common";
import { buildDataString, parseWebauthnJson } from "./common-webauthn";

require("./webauthn.scss");

let parsed = false;
let webauthnJson: any;
let parentUrl: string = null;
let sentSuccess = false;
let locale: string = null;
let i18nService: I18nService = null;

function parseParameters() {
  if (parsed) {
    return;
  }

  parentUrl = getQsParam("parent");
  if (!parentUrl) {
    error("No parent.");
    return;
  } else {
    parentUrl = decodeURIComponent(parentUrl);
  }

  locale = getQsParam("locale") ?? "en";

  const version = getQsParam("v");

  if (version === "1") {
    parseParametersV1();
  } else {
    parseParametersV2();
  }
  parsed = true;
}

function parseParametersV1() {
  const data = getQsParam("data");
  if (!data) {
    error("No data.");
    return;
  }

  webauthnJson = b64Decode(data);
}

function parseParametersV2() {
  let dataObj: { data: any; btnText: string } = null;
  try {
    dataObj = JSON.parse(b64Decode(getQsParam("data")));
  } catch (e) {
    error("Cannot parse data.");
    return;
  }

  webauthnJson = dataObj.data;
}

document.addEventListener("DOMContentLoaded", async () => {
  parseParameters();
  try {
    i18nService = new I18nService(locale, "locales");
  } catch {
    error("Failed to load the provided locale " + locale);
    i18nService = new I18nService("en", "locales");
  }

  await i18nService.init();

  document.getElementById("msg").innerText = i18nService.t("webAuthnFallbackMsg");
  document.getElementById("remember-label").innerText = i18nService.t("rememberMe");

  const button = document.getElementById("webauthn-button");
  button.innerText = i18nService.t("webAuthnAuthenticate");
  button.onclick = start;

  document.getElementById("spinner").classList.add("d-none");
  const content = document.getElementById("content");
  content.classList.add("d-block");
  content.classList.remove("d-none");
});

function start() {
  if (sentSuccess) {
    return;
  }

  if (!("credentials" in navigator)) {
    error(i18nService.t("webAuthnNotSupported"));
    return;
  }

  parseParameters();
  if (!webauthnJson) {
    error("No data.");
    return;
  }

  let json: any;
  try {
    json = parseWebauthnJson(webauthnJson);
  } catch (e) {
    error("Cannot parse data.");
    return;
  }

  initWebAuthn(json);
}

async function initWebAuthn(obj: any) {
  try {
    const assertedCredential = (await navigator.credentials.get({
      publicKey: obj,
    })) as PublicKeyCredential;

    if (sentSuccess) {
      return;
    }

    const dataString = buildDataString(assertedCredential);
    const remember = (document.getElementById("remember") as HTMLInputElement).checked;
    window.postMessage({ command: "webAuthnResult", data: dataString, remember: remember }, "*");

    sentSuccess = true;
    success(i18nService.t("webAuthnSuccess"));
  } catch (err) {
    error(err);
  }
}

function error(message: string) {
  const el = document.getElementById("msg");
  resetMsgBox(el);
  el.textContent = message;
  el.classList.add("alert");
  el.classList.add("alert-danger");
}

function success(message: string) {
  (document.getElementById("webauthn-button") as HTMLButtonElement).disabled = true;

  const el = document.getElementById("msg");
  resetMsgBox(el);
  el.textContent = message;
  el.classList.add("alert");
  el.classList.add("alert-success");
}

function resetMsgBox(el: HTMLElement) {
  el.classList.remove("alert");
  el.classList.remove("alert-danger");
  el.classList.remove("alert-success");
}
