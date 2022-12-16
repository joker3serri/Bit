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

      /**
       * We can update this to the "satisfies" type upon upgrading to TypeScript 4.9
       * https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/#satisfies
       */
      const products: Record<"pm" | "sm" | "orgs", ProductSwitcherItem> = {
        pm: {
          name: "Password Manager",
          icon: "bwi-lock",
          appRoute: "/vault",
          marketingRoute: "https://bitwarden.com/products/personal/",
        },
        sm: {
          name: "Secrets Manager Beta",
          icon: "bwi-cli",
          appRoute: ["/sm", smOrg?.id],
          // TODO: update marketing link
          marketingRoute: "#",
        },
        orgs: {
          name: "Organizations",
          icon: "bwi-business",
          marketingRoute: "https://bitwarden.com/products/business/",
        },
      };

      const bento: ProductSwitcherItem[] = [products.pm];
      const other: ProductSwitcherItem[] = [];

      if (smOrg) {
        bento.push(products.sm);
      }

      if (orgs.length === 0) {
        other.push(products.orgs);
      }

      return {
        bento,
        other,
      };
    })
  );

  constructor(private organizationService: OrganizationService, private route: ActivatedRoute) {}
}
