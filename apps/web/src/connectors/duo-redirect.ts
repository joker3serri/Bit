import { getQsParam } from "./common";
import { TranslationService } from "./translation.service";

require("./duo-redirect.scss");

const mobileDesktopCallback = "bitwarden://duo-callback";
let localeService: TranslationService = null;

window.addEventListener("load", async () => {
  const redirectUrl = getQsParam("duoFramelessUrl");

  if (redirectUrl) {
    redirectToDuoFrameless(redirectUrl);
    return;
  }

  const client = getQsParam("client");
  const code = getQsParam("code");
  const state = getQsParam("state");

  localeService = new TranslationService(navigator.language, "locales");
  await localeService.init();

  if (client === "web") {
    const channel = new BroadcastChannel("duoResult");

    channel.postMessage({ code: code, state: state });
    channel.close();

    displayHandoffMessage(client);
  } else if (client === "browser") {
    window.postMessage({ command: "duoResult", code: code, state: state }, "*");
    displayHandoffMessage(client);
  } else if (client === "mobile" || client === "desktop") {
    if (client === "desktop") {
      displayHandoffMessage(client);
    }
    document.location.replace(
      mobileDesktopCallback +
        "?code=" +
        encodeURIComponent(code) +
        "&state=" +
        encodeURIComponent(state),
    );
  }
});

/**
 * validate the Duo AuthUrl and redirect to it.
 * @param redirectUrl the duo auth url
 */
function redirectToDuoFrameless(redirectUrl: string) {
  const validateUrl = new URL(redirectUrl);

  if (validateUrl.protocol !== "https:" || !validateUrl.hostname.endsWith("duosecurity.com")) {
    throw new Error("Invalid redirect URL");
  }

  window.location.href = decodeURIComponent(redirectUrl);
}

/**
 * The `title`, `message`, and `buttonText` properties will be used to create the
 * relevant DOM elements.
 *
 * Countdown timer:
 * The `isCountdown` signifies that you want to start a countdown timer that will
 * automatically close the tab when finished. The starting point for the timer will
 * be based upon the first number that can be parsed from the `message` property
 * (so be sure to add exactly one number to the `message`).
 *
 * If `isCountdown` is undefined/false, there will be no countdown timer and the user
 * will simply have to close the tab manually.
 *
 * If `buttonText` is undefined, there will be no close button.
 *
 * Note: browsers won't let javascript close a tab that wasn't opened by javascript,
 * so some clients may not be able to take advantage of the countdown timer/close button.
 */
function displayHandoffMessage(client: string) {
  const content = document.getElementById("content");
  content.className = "text-center";
  content.innerHTML = "";

  const h1 = document.createElement("h1");
  const p = document.createElement("p");

  h1.textContent = localeService.t("youSuccessfullyLoggedIn");
  p.textContent =
    client == "web"
      ? (p.textContent = localeService.t("thisWindowWillCloseIn5Seconds"))
      : localeService.t("youMayCloseThisWindow");

  h1.className = "font-weight-semibold";
  p.className = "mb-4";

  content.appendChild(h1);
  content.appendChild(p);

  // Web client will have a close button as well as an auto close timer
  if (client == "web") {
    const button = document.createElement("button");
    button.textContent = localeService.t("close");
    button.className = "bg-primary text-white border-0 rounded py-2 px-3";

    button.addEventListener("click", () => {
      window.close();
    });
    content.appendChild(button);

    // Countdown timer (closes tab upon completion)
    let num = Number(p.textContent.match(/\d+/)[0]);

    const interval = setInterval(() => {
      if (num > 1) {
        p.textContent = p.textContent.replace(String(num), String(num - 1));
        num--;
      } else {
        clearInterval(interval);
        window.close();
      }
    }, 1000);
  }
}
