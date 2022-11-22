import { AfterViewInit, Component, ElementRef, HostListener, Input } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";

@Component({
  selector: "nav-item",
  templateUrl: "./nav-item.component.html",
})
export class NavItemComponent implements AfterViewInit {
  constructor(public elRef: ElementRef<HTMLElement>) {}

  /**
   * Title text to display
   */
  @Input() title: string;

  /**
   * Optional icon, e.g. `"bwi-collection"`
   */
  @Input() icon: string;

  /**
   * Passed to internal `routerLink`
   **/
  @Input() to: string;

  /**
   * If this item is used within a tree, set `variant` to `"tree"`
   */
  @Input() variant: "default" | "tree" = "default";

  /**
   * - is `true` if the host component has a descendant that matches `.fvw:focus-visible`
   * - can be removed when `:has()` or `:focus-visible-within` get broader browser support
   */
  protected focusVisibleWithin$ = new BehaviorSubject(false);
  protected fvwStyles$ = this.focusVisibleWithin$.pipe(
    map((value) => (value ? "tw-z-10 tw-rounded tw-outline-none tw-ring tw-ring-text-alt2" : ""))
  );

  @HostListener("focusin", ["$event.target"])
  onFocusIn(target: HTMLElement) {
    this.focusVisibleWithin$.next(target.matches(".fvw:focus-visible"));
  }

  @HostListener("focusout")
  onFocusOut() {
    this.focusVisibleWithin$.next(false);
  }

  ngAfterViewInit() {
    if (this.variant === "tree") {
      this.elRef.nativeElement.style.setProperty("--base-left-padding", "2.5rem");
    }
  }
}
