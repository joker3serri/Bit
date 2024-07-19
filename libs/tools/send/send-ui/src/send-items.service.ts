import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from "rxjs";

import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import { SendService } from "@bitwarden/common/tools/send/services/send.service.abstraction";

/**
 * Service for managing the various item lists on the new Vault tab in the browser popup.
 */
@Injectable({
  providedIn: "root",
})
export class SearchItemsService {
  private _searchText$ = new BehaviorSubject<string>("");

  /**
   * Subject that emits whenever new sends are being processed/filtered.
   * @private
   */
  private _sendsLoading$ = new Subject<void>();

  latestSearchText$: Observable<string> = this._searchText$.asObservable();
  sendList$: Observable<SendView[]> = this.sendService.sendViews$;

  private _filteredSends$: Observable<SendView[]> = combineLatest([
    this.sendList$,
    this._searchText$,
    this.vaultPopupListFiltersService.filterFunctions$,
  ]).pipe(
    tap(() => this._sendsLoading$.next()),
    map(([sends, searchText, filterFunction]): [SendView[], string] => [
      filterFunction(sends),
      searchText,
    ]),
    switchMap(([sends, searchText]) => this.searchService.searchSends(sends, searchText)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /**
   * Observable that indicates whether the service is currently loading sends.
   */
  loading$: Observable<boolean> = merge(
    this._sendsLoading$.pipe(map(() => true)),
    this.remainingCiphers$.pipe(map(() => false)),
  ).pipe(startWith(true), distinctUntilChanged(), shareReplay({ refCount: false, bufferSize: 1 }));

  /**
   * Observable that indicates whether a filter is currently applied to the sends.
   */
  hasFilterApplied$ = combineLatest([
    this._searchText$,
    this.vaultPopupListFiltersService.filters$,
  ]).pipe(
    switchMap(([searchText, filters]) => {
      return from(this.searchService.isSearchable(searchText)).pipe(
        map(
          (isSearchable) =>
            isSearchable || Object.values(filters).some((filter) => filter !== null),
        ),
      );
    }),
  );

  /**
   * Observable that indicates whether the user's vault is empty.
   */
  emptyList$: Observable<boolean> = this._sendList$.pipe(map((sends) => !sends.length));

  /**
   * Observable that indicates whether there are no sends to show with the current filter.
   */
  noFilteredResults$: Observable<boolean> = this._filteredSends$.pipe(
    map((sends) => !sends.length),
  );

  constructor(
    private sendService: SendService,
    private vaultPopupListFiltersService: VaultPopupListFiltersService,
    private searchService: SearchService,
  ) {}

  applyFilter(newSearchText: string) {
    this._searchText$.next(newSearchText);
  }
}
