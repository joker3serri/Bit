document.addEventListener("DOMContentLoaded", (_) => {
  if (window.location.hostname.endsWith("vault.bitwarden.com")) {
    return;
  }

  const inIframe = isInIframe();
  const inputSelector =
    'input:not([type]),input[type="email"],input[type="password"],input[type="text"]';

  let barType: string = null;
  let disabledAddLoginNotification = false;
  let disabledChangedPasswordNotification = false;

  const activeUserIdKey = "activeUserId";
  let activeUserId: string;
  chrome.storage.local.get(activeUserIdKey, (obj: any) => {
    if (obj == null || obj[activeUserIdKey] == null) {
      return;
    }
    activeUserId = obj[activeUserIdKey];
  });

  chrome.storage.local.get(activeUserId, (obj: any) => {
    if (obj?.[activeUserId] == null) {
      return;
    }

    const domains = obj[activeUserId].settings.neverDomains;
    // eslint-disable-next-line
    if (domains != null && domains.hasOwnProperty(window.location.hostname)) {
      return;
    }

    disabledAddLoginNotification = obj[activeUserId].settings.disableAddLoginNotification;
    disabledChangedPasswordNotification =
      obj[activeUserId].settings.disableChangedPasswordNotification;

    if (!disabledAddLoginNotification || !disabledChangedPasswordNotification) {
      startTrackingFormSubmissions();
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    processMessages(msg, sendResponse);
  });

  function processMessages(msg: any, sendResponse: (response?: any) => void) {
    if (msg.command === "openNotificationBar") {
      if (inIframe) {
        return;
      }
      closeExistingAndOpenBar(msg.data.type, msg.data.typeData);
      sendResponse();
      return true;
    } else if (msg.command === "closeNotificationBar") {
      if (inIframe) {
        return;
      }
      closeBar(true);
      sendResponse();
      return true;
    } else if (msg.command === "adjustNotificationBar") {
      if (inIframe) {
        return;
      }
      adjustBar(msg.data);
      sendResponse();
      return true;
    }
  }

  function startTrackingFormSubmissions() {
    document.addEventListener("submit", (e: UIEvent) => {
      startRequestListener(e.target as HTMLElement);
      sendPlatformMessage({
        command: "formSubmission",
        data: createFormData({ formChild: e.target as HTMLElement }),
      });
    });

    window.addEventListener("bw-submit", (e: CustomEvent) => {
      startRequestListener(e.detail?.form as HTMLElement);
      sendPlatformMessage({
        command: "formSubmission",
        data: createFormData({ formChild: e.detail?.form as HTMLElement }),
      });
    });

    document.addEventListener("mouseup", (e: MouseEvent) => {
      const targetNode = e.target as HTMLElement;
      if (canBeSubmitElement(targetNode)) startRequestListener(targetNode);
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const key = e.key || e.keyCode;
      if (key === "Enter" || key === 13) {
        startRequestListener(e.target as HTMLElement);
      }
    });

    function hook() {
      let requestCounter = 0;

      const proxyFormSubmit = (func: any) => {
        return new Proxy(func, {
          apply: (target, receiver, args) => {
            window.dispatchEvent(
              new CustomEvent("bw-submit", {
                detail: {
                  form: receiver,
                },
              })
            );
            return target.apply(receiver, args);
          },
        });
      };
      Array.from(document.forms).forEach(
        (form) => ((form.submit as any) = proxyFormSubmit(form.submit))
      );
      Document.prototype.createElement = new Proxy(Document.prototype.createElement, {
        apply: (target, receiver, args) => {
          const result = target.apply(receiver, args);
          if (result?.nodeName === "FORM" && result?.submit)
            result.submit = proxyFormSubmit(result.submit);
          return result;
        },
      });

      const xmlSendOriginalMethod = XMLHttpRequest.prototype.send;
      const xmlSendProxy = new Proxy(xmlSendOriginalMethod, {
        apply: (target, receiver, args) => {
          if (args[0] && (typeof args[0] === "string" || typeof args[0] === "object")) {
            const data = typeof args[0] === "object" ? JSON.stringify(args[0]) : args[0];
            const reqId = ++requestCounter;
            window.dispatchEvent(
              new CustomEvent("bw-request-start", {
                detail: {
                  data: data,
                  reqId: reqId,
                },
              })
            );
            receiver.addEventListener("loadend", () => {
              window.dispatchEvent(
                new CustomEvent("bw-request-end", {
                  detail: {
                    status: receiver.status,
                    reqId: reqId,
                  },
                })
              );
            });
          }
          return target.apply(receiver, args);
        },
      });
      XMLHttpRequest.prototype.send = xmlSendProxy;

      const fetchOriginalMethod = fetch;
      const fetchProxy = new Proxy(fetchOriginalMethod, {
        apply: (target, receiver, args) => {
          const response = target.apply(receiver, args);
          if (args[0] && (typeof args[0] === "string" || typeof args[0] === "object")) {
            const data = typeof args[0] === "object" ? JSON.stringify(args[0]) : args[0];
            const reqId = ++requestCounter;
            window.dispatchEvent(
              new CustomEvent("bw-request-start", {
                detail: {
                  data: data,
                  reqId: reqId,
                },
              })
            );
            const callback = (res: any) => {
              window.dispatchEvent(
                new CustomEvent("bw-request-end", {
                  detail: {
                    status: res && res.status,
                    reqId: reqId,
                  },
                })
              );
            };
            response.then(callback).catch(callback);
          }
          return response;
        },
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-global-assign
      fetch = fetchProxy;
    }
    const hookScript = hook.toString() + "hook();";
    const scriptElement = document.createElement("script");
    scriptElement.appendChild(document.createTextNode(hookScript));
    document.documentElement.appendChild(scriptElement);
    document.documentElement.removeChild(scriptElement);
  }

  function canBeSubmitElement(el: HTMLElement) {
    if (el.nodeName === "TEXTAREA" || el.nodeName === "SELECT") return false;
    if (el.nodeName === "INPUT")
      return (
        (el as HTMLInputElement).type === "button" || (el as HTMLInputElement).type === "submit"
      );
    return true;
  }

  function createFormData(data: { formChild: HTMLElement; formElement?: HTMLElement }) {
    data.formElement = findFormElement(data.formChild);
    if (!data.formElement) {
      // Fallback to trying to find form in entire page
      const passwordField = document.querySelector("input[type=password]") as HTMLElement;
      if (passwordField) data.formElement = findFormElement(passwordField);
    }

    const formFields = Array.from(
      (data.formElement || document.body).querySelectorAll(
        inputSelector
      ) as NodeListOf<HTMLInputElement>
    )
      .filter((input) => input.value && input.value.length > 0 && isVisible(input))
      .map((input) => {
        return {
          type: input.type,
          value: input.value,
          attributes: Array.from(input.attributes)
            .map((attr) => attr.name + "-" + attr.value)
            .join(","),
        };
      });

    return {
      url: document.URL,
      fields: formFields,
    };
  }

  function findFormElement(element: HTMLElement) {
    while (element) {
      if (element.nodeName === "FORM") return element;
      element = element.parentElement;
    }
    return null;
  }

  function isVisible(element: HTMLElement) {
    return element.offsetHeight || element.offsetWidth || element.getClientRects().length;
  }

  const requestListeners: any[] = [];
  function startRequestListener(formChild: HTMLElement) {
    const formData = createFormData({ formChild: formChild });
    requestListeners.forEach((listener) =>
      window.removeEventListener("bw-request-start", listener)
    );

    const eventListener = (event: any) => {
      if (!event.detail || !event.detail.data) return;
      const requestData = decodeURIComponent(event.detail.data);
      const isDataPresent = formData.fields.some(
        (field) => requestData.includes(field.value) || field.value.includes(requestData)
      );
      if (!isDataPresent) return;

      window.removeEventListener("bw-request-start", eventListener);
      const endEventListener = (endEvent: any) => {
        if (endEvent.detail.reqId !== event.detail.reqId) return;
        window.removeEventListener("bw-request-end", endEventListener);
        if (endEvent.detail.status >= 200 && endEvent.detail.status < 300) {
          sendPlatformMessage({
            command: "formSubmission",
            data: formData,
          });
        }
      };
      window.addEventListener("bw-request-end", endEventListener);
    };
    window.addEventListener("bw-request-start", eventListener);
    requestListeners.push(eventListener);
  }

  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  function closeExistingAndOpenBar(type: string, typeData: any) {
    let barPage = "notification/bar.html";
    switch (type) {
      case "add":
        barPage = barPage + "?add=1&isVaultLocked=" + typeData.isVaultLocked;
        break;
      case "change":
        barPage = barPage + "?change=1&isVaultLocked=" + typeData.isVaultLocked;
        break;
      default:
        break;
    }

    const frame = document.getElementById("bit-notification-bar-iframe") as HTMLIFrameElement;
    if (frame != null && frame.src.indexOf(barPage) >= 0) {
      return;
    }

    closeBar(false);
    openBar(type, barPage);
  }

  function openBar(type: string, barPage: string) {
    barType = type;

    if (document.body == null) {
      return;
    }

    const barPageUrl: string = chrome.extension.getURL(barPage);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "height: 42px; width: 100%; border: 0; min-height: initial;";
    iframe.id = "bit-notification-bar-iframe";
    iframe.src = barPageUrl;

    const frameDiv = document.createElement("div");
    frameDiv.setAttribute("aria-live", "polite");
    frameDiv.id = "bit-notification-bar";
    frameDiv.style.cssText =
      "height: 42px; width: 100%; top: 0; left: 0; padding: 0; position: fixed; " +
      "z-index: 2147483647; visibility: visible;";
    frameDiv.appendChild(iframe);
    document.body.appendChild(frameDiv);

    (iframe.contentWindow.location as any) = barPageUrl;

    const spacer = document.createElement("div");
    spacer.id = "bit-notification-bar-spacer";
    spacer.style.cssText = "height: 42px;";
    document.body.insertBefore(spacer, document.body.firstChild);
  }

  function closeBar(explicitClose: boolean) {
    const barEl = document.getElementById("bit-notification-bar");
    if (barEl != null) {
      barEl.parentElement.removeChild(barEl);
    }

    const spacerEl = document.getElementById("bit-notification-bar-spacer");
    if (spacerEl) {
      spacerEl.parentElement.removeChild(spacerEl);
    }

    if (!explicitClose) {
      return;
    }

    switch (barType) {
      case "add":
        sendPlatformMessage({
          command: "bgAddClose",
        });
        break;
      case "change":
        sendPlatformMessage({
          command: "bgChangeClose",
        });
        break;
      default:
        break;
    }
  }

  function adjustBar(data: any) {
    if (data != null && data.height !== 42) {
      const newHeight = data.height + "px";
      doHeightAdjustment("bit-notification-bar-iframe", newHeight);
      doHeightAdjustment("bit-notification-bar", newHeight);
      doHeightAdjustment("bit-notification-bar-spacer", newHeight);
    }
  }

  function doHeightAdjustment(elId: string, heightStyle: string) {
    const el = document.getElementById(elId);
    if (el != null) {
      el.style.height = heightStyle;
    }
  }

  function sendPlatformMessage(msg: any) {
    chrome.runtime.sendMessage(msg);
  }
});
