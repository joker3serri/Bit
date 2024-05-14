import { Component, OnDestroy, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-vault-v2-search",
  templateUrl: "vault-v2-search.component.html",
})
export class VaultV2SearchComponent implements OnInit, OnDestroy {
  searchText: string;
  @Output() searchTextChanged = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSearchTextChanged(t: string) {
    this.searchText = t;
    this.searchTextChanged.emit(t);
  }
}
