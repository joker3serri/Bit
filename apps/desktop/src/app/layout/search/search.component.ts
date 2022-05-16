import { Component, NgZone } from "@angular/core";
import { FormControl } from "@angular/forms";

import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";

import { SearchBarService, SearchBarState } from "./search-bar.service";

const BroadcasterSubscriptionId = "SearchComponent";

@Component({
  selector: "app-search",
  templateUrl: "search.component.html",
})
export class SearchComponent {
  state: SearchBarState;
  searchText: FormControl = new FormControl(null);

  constructor(
    private searchBarService: SearchBarService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone
  ) {
    this.searchBarService.state.subscribe((state) => {
      this.state = state;
    });

    this.searchText.valueChanges.subscribe((value) => {
      this.searchBarService.setSearchText(value);
    });
  }

  ngOnInit() {
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "clearSearchBarText":
            this.searchBarService.setSearchText("");
            this.searchText.patchValue("");
            break;
        }
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }
}
