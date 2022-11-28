import { Directive, Input } from "@angular/core";

/**
 * Base class used in `NavGroupComponent` and `NavItemComponent`
 */
@Directive()
export abstract class NavBaseComponent {
  /**
   * Text to display in main content
   */
  @Input() text: string;

  /**
   * Optional icon, e.g. `"bwi-collection"`
   */
  @Input() icon: string;

  /**
   * Route to be passed to internal `routerLink`
   */
  @Input() route: string;

  /**
   * If this item is used within a tree, set `variant` to `"tree"`
   */
  @Input() variant: "default" | "tree" = "default";

  /**
   * Depth level when nested inside of a `'tree'` variant
   */
  @Input() treeDepth = 0;
}
