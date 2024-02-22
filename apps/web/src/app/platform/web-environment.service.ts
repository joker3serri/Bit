import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { Urls } from "@bitwarden/common/platform/abstractions/environment.service";
import { EnvironmentService } from "@bitwarden/common/platform/services/environment.service";
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
    super(stateProvider, accountService);

    // The web vault always uses the current location as the base url
    const urls = process.env.URLS as Urls;
    urls.base ??= this.win.location.origin;
    this.setUrlsInternal(urls);
    // TODO: Remove this when implementing ticket PM-2637
    this.initialized = true;
  }

  // Web cannot set urls from storage
  async setUrls(urls: Urls): Promise<Urls> {
    return;
  }

  // Web cannot set urls from storage
  async setUrlsFromStorage(): Promise<void> {
    return;
  }
}
