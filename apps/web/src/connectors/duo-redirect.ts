import { getQsParam } from "./common";

const mobileDesktopCallback = "bitwarden://duo-callback";

window.addEventListener("load", () => {
  const client = getQsParam("client");
  const code = getQsParam("duo_code");

  if (client === "browser" || client === "web") {
    const channel = new BroadcastChannel("duoResult");

    channel.postMessage({ code: code });
    channel.close();
  } else if (client === "mobile" || client === "desktop") {
    document.location.replace(mobileDesktopCallback + "?code=" + encodeURIComponent(code));
  }
});
