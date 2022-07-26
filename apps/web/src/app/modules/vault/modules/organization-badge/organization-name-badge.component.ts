import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/misc/utils";

@Component({
  selector: "app-org-badge",
  templateUrl: "organization-name-badge.component.html",
})
export class OrganizationNameBadgeComponent implements OnInit {
  @Input() organizationName: string;
  @Input() profileName: string;

  @Output() onOrganizationClicked = new EventEmitter<string>();

  color: string;
  textColor: string;

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    if (this.organizationName == null || this.organizationName === "") {
      this.organizationName = this.i18nService.t("me");
      this.color = this.stringToColor(this.profileName.toUpperCase());
    }
    if (this.color == null) {
      this.color = this.stringToColor(this.organizationName.toUpperCase());
    }
    this.textColor = Utils.pickTextColorBasedOnBgColor(this.color);
  }

  // This value currently isn't stored anywhere, only calculated in the app-avatar component
  // Once we are allowing org colors to be changed and saved, change this out
  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }

  emitOnOrganizationClicked() {
    this.onOrganizationClicked.emit();
  }
}
