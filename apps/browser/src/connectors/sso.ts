if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSsoConnector);
} else {
  loadSsoConnector();
}

function loadSsoConnector() {
  const lastPass = getQsParam("lp");
  const code = getQsParam("code");
  const state = getQsParam("state");
  if (lastPass === "1") {
    window.location.href =
      "/popup/index.html?uilocation=popout#/import?code=" + code + "&state=" + state;
  }
}

function getQsParam(name: string) {
  const url = window.location.href;
  // eslint-disable-next-line
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
