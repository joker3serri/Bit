import { Pipe, PipeTransform } from "@angular/core";

import { ProductTierType } from "@bitwarden/common/billing/enums";

@Pipe({ name: "orgIcon" })
export class OrgIconPipe implements PipeTransform {
  transform(productTierType: number): string {
    switch (productTierType) {
      case ProductTierType.Free:
      case ProductTierType.Families:
        return "bwi-family";
      case ProductTierType.Teams:
      case ProductTierType.Enterprise:
      case ProductTierType.TeamsStarter:
        return "bwi-business";
      default:
        return null;
    }
  }
}
