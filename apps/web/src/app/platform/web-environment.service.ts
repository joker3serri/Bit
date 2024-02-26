import { ReplaySubject } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import {
  Environment,
  Region,
  Urls,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  EnvironmentService,
  UrlEnvironment,
} from "@bitwarden/common/platform/services/environment.service";
import { StateProvider } from "@bitwarden/common/platform/state";

/**
 * Web specific environment service. Ensures that the urls are set from the window location.
 */
export class WebEnvironmentService extends EnvironmentService {
  constructor(
    private win: Window,
    stateProvider: StateProvider,
    accountService: AccountService,
  ) {
    // Prevent subscribing to the state driven environment$
    super(stateProvider, accountService, false);

    // The web vault always uses the current location as the base url
    const urls = process.env.URLS as Urls;
    urls.base ??= this.win.location.origin;

    // Find the region
    const domain = Utils.getDomain(this.win.location.href);
    const region = this.availableRegions().find((r) => Utils.getDomain(r.urls.webVault) === domain);

    this.environment = new UrlEnvironment(region.key, urls);

    // Override the environment observable with a replay subject
    const subject = new ReplaySubject<Environment>(1);
    subject.next(this.environment);
    this.environment$ = subject.asObservable();
  }

  // Web cannot set environment
  async setEnvironment(region: Region, urls?: Urls): Promise<Urls> {
    return;
  }

  // Web cannot set urls from storage
  async setUrlsFromStorage(): Promise<void> {
    return;
  }
}
