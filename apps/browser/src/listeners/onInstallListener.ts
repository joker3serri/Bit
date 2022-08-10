import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { environmentServiceFactory } from "../background/service_factories/environment-service.factory";
import { BrowserApi } from "../browser/browserApi";
import { Account } from "../models/account";

export function onInstallListener(details: chrome.runtime.InstalledDetails) {
  const opts = {
    logMacFailures: false,
    win: self,
    isDev: false,
    stateFactory: new StateFactory(GlobalState, Account),
    instances: {},
  };
  const environmentService = environmentServiceFactory(opts);

  setTimeout(async () => {
    if (details.reason != null && details.reason === "install") {
      BrowserApi.createNewTab("https://bitwarden.com/browser-start/");

      if (await environmentService.hasManagedEnvironment()) {
        await environmentService.setUrlsToManagedEnvironment();
      }
    }
  }, 100);
}
