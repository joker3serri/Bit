import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ChipSelectComponent } from "@bitwarden/components";

import {
  PopupListFilter,
  VaultPopupListFiltersService,
} from "../../../services/vault-popup-list-filters.service";

@Component({
  standalone: true,
  selector: "app-vault-list-filters",
  templateUrl: "./vault-list-filters.component.html",
  imports: [CommonModule, JslibModule, ChipSelectComponent, ReactiveFormsModule],
})
export class VaultListFiltersComponent implements OnInit, OnDestroy {
  protected destroy$ = new Subject<void>();

  filterForm = this.formBuilder.group<PopupListFilter>({
    cipherType: null,
    organization: null,
    collection: null,
    folder: null,
  });

  protected organizations$ = this.vaultPopupListFiltersService.organizations$;
  protected collections$ = this.vaultPopupListFiltersService.collections$;
  protected folders$ = this.vaultPopupListFiltersService.folders$;
  protected cipherTypes$ = this.vaultPopupListFiltersService.cipherTypes$;

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
