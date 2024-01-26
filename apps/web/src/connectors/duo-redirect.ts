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

  // Countdown timer
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
