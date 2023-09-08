import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Injectable({
  providedIn: "root",
})
export class BrowserRouterService {
  private previousUrl: string = undefined;

  constructor(private router: Router, private stateService: StateService) {
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

  getPreviousUrl() {
    return this.previousUrl;
  }

  setPreviousUrl(url: string) {
    this.previousUrl = url;
  }
}
