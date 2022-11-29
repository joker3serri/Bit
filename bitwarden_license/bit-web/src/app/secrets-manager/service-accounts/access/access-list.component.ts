import { SelectionModel } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { AccessTokenView } from "../models/view/access-token.view";

@Component({
  selector: "sm-access-list",
  templateUrl: "./access-list.component.html",
})
export class AccessListComponent {
  @Input()
  get tokens(): AccessTokenView[] {
    return this._tokens;
  }
  set tokens(secrets: AccessTokenView[]) {
    this.selection.clear();
    this._tokens = secrets;
  }
  private _tokens: AccessTokenView[];

  @Output() newAccessTokenEvent = new EventEmitter();

  protected selection = new SelectionModel<string>(true, []);

  constructor(private i18nService: I18nService, private datePipe: DatePipe) {}

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tokens.length;
    return numSelected === numRows;
  }

  toggleAll() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.tokens.map((s) => s.id));
  }

  protected permission(token: AccessTokenView) {
    return "canRead";
  }

  getExpiration(token: AccessTokenView) {
    if (token.expireAt == null) {
      return this.i18nService.t("never");
    }
    return this.datePipe.transform(token.expireAt, "medium");
  }
}
