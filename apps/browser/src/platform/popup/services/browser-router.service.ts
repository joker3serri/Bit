import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Injectable({
  providedIn: "root",
})
export class BrowserRouterService {
  constructor(router: Router, private stateService: StateService) {
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const state: ActivatedRouteSnapshot = router.routerState.snapshot.root;

        let child = state.firstChild;
        while (child.firstChild) {
          child = child.firstChild;
        }

        const updateUrl = !child?.data?.doNotSaveUrl ?? true;

        if (updateUrl) {
          this.setPreviousUrl(event.url);
        }
      });
  }

  async getPreviousUrl() {
    return this.stateService.getPreviousUrl();
  }

  // Check validity of previous url
  async hasPreviousUrl() {
    return (await this.getPreviousUrl()) != "/";
  }

  async setPreviousUrl(url: string) {
    await this.stateService.setPreviousUrl(url);
  }
}
