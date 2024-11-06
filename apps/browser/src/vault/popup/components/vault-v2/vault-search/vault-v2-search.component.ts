import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Subject, Subscription, debounceTime, filter } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SearchModule } from "@bitwarden/components";

import { VaultPopupItemsService } from "../../../services/vault-popup-items.service";

const SearchTextDebounceInterval = 200;

@Component({
  imports: [CommonModule, SearchModule, JslibModule, FormsModule],
  standalone: true,
  selector: "app-vault-v2-search",
  templateUrl: "vault-v2-search.component.html",
})
export class VaultV2SearchComponent implements AfterViewInit {
  @ViewChild("search") searchElement: { input: ElementRef };
  searchText: string;

  private searchText$ = new Subject<string>();

  constructor(private vaultPopupItemsService: VaultPopupItemsService) {
    this.subscribeToLatestSearchText();
    this.subscribeToApplyFilter();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchElement.input.nativeElement.focus();
    }, 500);
  }

  onSearchTextChanged() {
    this.searchText$.next(this.searchText);
  }

  subscribeToLatestSearchText(): Subscription {
    return this.vaultPopupItemsService.latestSearchText$
      .pipe(
        takeUntilDestroyed(),
        filter((data) => !!data),
      )
      .subscribe((text) => {
        this.searchText = text;
      });
  }

  subscribeToApplyFilter(): Subscription {
    return this.searchText$
      .pipe(debounceTime(SearchTextDebounceInterval), takeUntilDestroyed())
      .subscribe((data) => {
        this.vaultPopupItemsService.applyFilter(data);
      });
  }
}
