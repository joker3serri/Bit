import { getQsParam } from "./common";

const mobileDesktopCallback = "bitwarden://duo-callback";

window.addEventListener("load", () => {
  // TODO: verify that we don't need to pass state

  const code = getQsParam("code");
  console.log("code", code);

  // TODO: verify client is the correct param name
  const client = getQsParam("client");
  console.log("client", client);

  if (client === "browser" || client === "web") {
    // Connect to the channel named "my_bus".
    const channel = new BroadcastChannel("duoResult");

    // Send a message on "my_bus".
    channel.postMessage({ code: code });

    // Close the channel when you're done.
    channel.close();
  } else if (client === "mobile" || client === "desktop") {
    document.location.replace(mobileDesktopCallback + "?code=" + encodeURIComponent(code));
  }
});
