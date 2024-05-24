import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter, OnDestroy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, debounceTime, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SearchModule } from "@bitwarden/components";

const SearchTextDebounceInterval = 200;

@Component({
  imports: [CommonModule, SearchModule, JslibModule, FormsModule],
  standalone: true,
  selector: "app-vault-v2-search",
  templateUrl: "vault-v2-search.component.html",
})
export class VaultV2SearchComponent implements OnDestroy {
  searchText: string;
  @Output() searchTextChanged = new EventEmitter<string>();

  private searchText$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchText$
      .pipe(debounceTime(SearchTextDebounceInterval), takeUntil(this.destroy$))
      .subscribe((data) => {
        this.searchTextChanged.emit(data);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchTextChanged() {
    this.searchText$.next(this.searchText);
  }
}
