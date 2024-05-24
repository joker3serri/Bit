import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Subject, map, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SelectModule } from "@bitwarden/components";

import {
  PopupListFilter,
  VaultPopupListFiltersService,
} from "../../../services/vault-popup-list-filters.service";

@Component({
  standalone: true,
  selector: "app-vault-list-filters",
  templateUrl: "./vault-list-filters.component.html",
  imports: [CommonModule, JslibModule, SelectModule, ReactiveFormsModule],
})
export class VaultListFiltersComponent implements OnInit, OnDestroy {
  protected destroy$ = new Subject<void>();

  filterForm = this.formBuilder.group<PopupListFilter>({
    cipherType: null,
    organizationId: null,
    collectionId: null,
    folderId: null,
  });

  protected cipherTypes$ = this.vaultPopupListFiltersService.cipherTypes$;
  protected organizations$ = this.vaultPopupListFiltersService.organizations$;
  protected collections$ = this.vaultPopupListFiltersService.collections$.pipe(
    map((collections) => collections.fullList),
  );

  protected allFolders$ = this.vaultPopupListFiltersService.folders$.pipe(
    map((nestedFolders) => {
      return nestedFolders.fullList.filter((folder) => folder.id !== null);
    }),
  );

  constructor(
    private formBuilder: FormBuilder,
    private vaultPopupListFiltersService: VaultPopupListFiltersService,
  ) {}

  ngOnInit(): void {
    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((formValue) => {
      this.vaultPopupListFiltersService.updateFilter(formValue);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
