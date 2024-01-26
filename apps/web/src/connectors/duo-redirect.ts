import { getQsParam } from "./common";

require("./duo-redirect.scss");

const mobileDesktopCallback = "bitwarden://duo-callback";

window.addEventListener("load", () => {
  const client = getQsParam("client");
  const code = getQsParam("code");

  if (client === "browser" || client === "web") {
    const channel = new BroadcastChannel("duoResult");

    channel.postMessage({ code: code });
    channel.close();

    handleMessage();
  } else if (client === "mobile" || client === "desktop") {
    document.location.replace(mobileDesktopCallback + "?code=" + encodeURIComponent(code));
  }
});

/**
 * The `duoHandOffMessage` is set in the client via a cookie. The reason this needs to be set
 * in the client is so that we can make use of i18n translations.
 *
 * Format the duoHandOffMessage cookie as "HTML-like" with 3 elements:
 * - <h1>{Custom text}</h1>
 * - <p>{Custom text}</p>
 * - <button>{Custom text}</button> -> used for closing the window manually
 *
 * An example would look like this (swap out text portions with interpolated i18n translated text):
 * document.cookie = "duoHandOffMessage=<h1>You successfully logged in</h1><p>This window will
 *   automatically close in 5 seconds</p><button>Close</button>;SameSite=strict"
 *
 * These "HTML elements" will be parsed to create the appropriate DOM elements with textContent.
 * You should not add any classes/styling, as styling will be handled here in the DOM element creation.
 *
 * Countdown timer:
 * - If the <p> tag text contains a number, that number will be parsed from the text
 *   and used as the starting point for the countdown timer, which upon completion will
 *   automatically close the tab. Make sure to only add one number, as only one will be parsed.
 *
 * - If the <p> tag does not contain a number there will be no countdown timer and the user
 *   will have to close the tab manually.
 *
 * - This implementation is intentionally simple in order to prevent the client (a) from having to add
 *   extra "HTML elements" and (b) from having to split up the <p> text into three spans/translations...
 *        ['This window will automatically close in', '5', 'seconds']
 *   ...which would cause bad translations in languages that swap the order of words
 */
const handleMessage = () => {
  const handOffMessage = ("; " + document.cookie)
    .split("; duoHandOffMessage=")
    .pop()
    .split(";")
    .shift();

  document.cookie = "duoHandOffMessage=;SameSite=strict;max-age=0";

  const content = document.getElementById("content");
  content.className = "text-center";
  content.innerHTML = "";

  const h1 = document.createElement("h1");
  const p = document.createElement("p");
  const button = document.createElement("button");

  h1.textContent = /<h1>(.*?)<\/h1>/g.exec(handOffMessage)[1]; // parse text from <h1> tag
  p.textContent = /<p>(.*?)<\/p>/g.exec(handOffMessage)[1];
  button.textContent = /<button>(.*?)<\/button>/g.exec(handOffMessage)[1];

  h1.className = "font-weight-semibold";
  p.className = "mb-4";
  button.className = "bg-primary text-white border-0 rounded py-2 px-3";

  button.addEventListener("click", () => {
    window.close();
  });

  content.appendChild(h1);
  content.appendChild(p);
  content.appendChild(button);

  let num = Number(p.textContent.match(/\d+/)[0]); // parse digit from string

  // Countdown timer (closes tab upon completion)
  if (num) {
    setInterval(() => {
      if (num > 1) {
        p.textContent = p.textContent.replace(String(num), String(num - 1));
        num--;
      }
    }, 1000);

    setTimeout(() => {
      window.close();
    }, num * 1000);
  }
};
