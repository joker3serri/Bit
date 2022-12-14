import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { IconButtonType } from "@bitwarden/components/src/icon-button/icon-button.component";

import { flagEnabled } from "../../../utils/flags";

type ProductSwitcherItem = {
  /**
   * Displayed name
   */
  name: string;

  /**
   * Displayed icon
   */
  icon: string;

  /**
   * Which section to show the product in
   */
  visibility: "bento" | "other" | "hidden";

  /**
   * Route for items in the `bentoProducts$` section
   */
  appRoute?: string | any[];

  /**
   * Route for items in the `otherProducts$` section
   */
  marketingRoute?: string | any[];
};

@Component({
  selector: "product-switcher",
  templateUrl: "./product-switcher.component.html",
})
export class ProductSwitcherComponent {
  protected isEnabled = flagEnabled("secretsManager");

  /**
   * Passed to the product switcher's `bitIconButton`
   */
  @Input()
  buttonType: IconButtonType = "main";

  protected products$ = combineLatest([
    this.organizationService.organizations$,
    this.route.paramMap,
  ]).pipe(
    map(([orgs, paramMap]) => {
      const routeOrg = orgs.find((o) => o.id === paramMap.get("organizationId"));
      // If the active route org doesn't have access to SM, find the first org that does.
      const smOrg = routeOrg?.canAccessSecretsManager
        ? routeOrg
        : orgs.find((o) => o.canAccessSecretsManager);

      const allProducts: ProductSwitcherItem[] = [
        {
          name: "Password Manager",
          icon: "bwi-lock",
          appRoute: "/vault",
          marketingRoute: "https://bitwarden.com/products/personal/",
          visibility: "bento",
        },
        {
          name: "Secrets Manager Beta",
          icon: "bwi-cli",
          appRoute: ["/sm", smOrg?.id],
          // TODO: update marketing link
          marketingRoute: "#",
          visibility: smOrg ? "bento" : "hidden",
        },
        {
          name: "Organizations",
          icon: "bwi-business",
          marketingRoute: "https://bitwarden.com/products/business/",
          visibility: orgs.length > 0 ? "hidden" : "other",
        },
      ];

      return arrayGroup(allProducts, (p) => p.visibility);
    })
  );

  constructor(private organizationService: OrganizationService, private route: ActivatedRoute) {}
}

/**
 * Partition an array into groups
 *
 * To be replaced by `Array.prototype.group()` upon standardization:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/group
 *
 * Source: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects#answer-64489535
 */
const arrayGroup = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });
