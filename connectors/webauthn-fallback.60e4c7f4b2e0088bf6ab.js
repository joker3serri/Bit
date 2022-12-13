(()=>{"use strict";var e={68674:(e,t,n)=>{n.r(t)}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var a=t[r]={exports:{}};return e[r](a,a.exports,n),a.exports}n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{function e(e){const t=window.location.href;e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}function t(e,t=!1){return t&&(e=e.replace(/ /g,"+")),decodeURIComponent(Array.prototype.map.call(atob(e),(e=>"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2))).join(""))}function r(e){if(Array.isArray(e)&&(e=Uint8Array.from(e)),e instanceof ArrayBuffer&&(e=new Uint8Array(e)),e instanceof Uint8Array){let t="";const n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);e=window.btoa(t)}if("string"!=typeof e)throw new Error("could not coerce to string");return e=e.replace(/\+/g,"-").replace(/\//g,"_").replace(/=*$/g,"")}var o=function(e,t,n,r){return new(n||(n=Promise))((function(o,a){function c(e){try{s(r.next(e))}catch(t){a(t)}}function i(e){try{s(r.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(c,i)}s((r=r.apply(e,t||[])).next())}))};n(68674);let a,c=!1,i=null,s=!1,d="en",l={};function u(){if(c)return;if(i=e("parent"),!i)return void y("No parent.");i=decodeURIComponent(i),d=e("locale").replace("-","_");"1"===e("v")?function(){const n=e("data");if(!n)return void y("No data.");a=t(n)}():function(){let n=null;try{n=JSON.parse(t(e("data")))}catch(r){return void y("Cannot parse data.")}a=n.data}(),c=!0}function f(e){return o(this,void 0,void 0,(function*(){const t=`locales/${e}/messages.json?cache=1qo7hma`,n=yield fetch(t);return yield n.json()}))}function m(e){var t;return(null===(t=l[e])||void 0===t?void 0:t.message)||""}function g(){if(s)return;if(!("credentials"in navigator))return void y(m("webAuthnNotSupported"));if(u(),!a)return void y("No data.");let e;try{e=function(e){const t=JSON.parse(e),n=t.challenge.replace(/-/g,"+").replace(/_/g,"/");return t.challenge=Uint8Array.from(atob(n),(e=>e.charCodeAt(0))),t.allowCredentials.forEach((e=>{const t=e.id.replace(/\_/g,"/").replace(/\-/g,"+");e.id=Uint8Array.from(atob(t),(e=>e.charCodeAt(0)))})),t}(a)}catch(t){return void y("Cannot parse data.")}!function(e){o(this,void 0,void 0,(function*(){try{const t=yield navigator.credentials.get({publicKey:e});if(s)return;const n=function(e){const t=e.response,n=new Uint8Array(t.authenticatorData),o=new Uint8Array(t.clientDataJSON),a=new Uint8Array(e.rawId),c=new Uint8Array(t.signature),i={id:e.id,rawId:r(a),type:e.type,extensions:e.getClientExtensionResults(),response:{authenticatorData:r(n),clientDataJson:r(o),signature:r(c)}};return JSON.stringify(i)}(t),o=document.getElementById("remember").checked;window.postMessage({command:"webAuthnResult",data:n,remember:o},"*"),s=!0,function(e){document.getElementById("webauthn-button").disabled=!0;const t=document.getElementById("msg");p(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-success")}(m("webAuthnSuccess"))}catch(t){y(t)}}))}(e)}function y(e){const t=document.getElementById("msg");p(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-danger")}function p(e){e.classList.remove("alert"),e.classList.remove("alert-danger"),e.classList.remove("alert-success")}document.addEventListener("DOMContentLoaded",(()=>o(void 0,void 0,void 0,(function*(){u();try{l=yield f(d)}catch(n){console.error("Failed to load the locale",d),l=yield f("en")}document.getElementById("msg").innerText=m("webAuthnFallbackMsg"),document.getElementById("remember-label").innerText=m("rememberMe");const e=document.getElementById("webauthn-button");e.innerText=m("webAuthnAuthenticate"),e.onclick=g,document.getElementById("spinner").classList.add("d-none");const t=document.getElementById("content");t.classList.add("d-block"),t.classList.remove("d-none")}))))})()})();
//# sourceMappingURL=webauthn-fallback.60e4c7f4b2e0088bf6ab.js.map