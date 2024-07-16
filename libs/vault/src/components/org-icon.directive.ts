import { Directive, HostBinding, Input } from "@angular/core";

import { ProductTierType } from "@bitwarden/common/billing/enums";

@Directive({
  standalone: true,
  selector: "[appOrgIcon]",
})
export class OrgIconDirective {
  @Input({ required: true }) tierType: ProductTierType;

  get orgIcon(): string {
    switch (this.tierType) {
      case ProductTierType.Free:
      case ProductTierType.Families:
        return "bwi-family";
      case ProductTierType.Teams:
      case ProductTierType.Enterprise:
      case ProductTierType.TeamsStarter:
        return "bwi-business";
      default:
        return "";
    }
  }

  @HostBinding("class") get classList() {
    return ["bwi", "bwi-lg", "bwi-fw", this.orgIcon];
  }
}
