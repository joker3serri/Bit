import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";

@Component({
  selector: "nav-group",
  templateUrl: "./nav-group.component.html",
})
export class NavGroupComponent implements AfterViewInit, OnDestroy {
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

  @ContentChildren(NavGroupComponent, {
    descendants: false,
  })
  nestedNavGroups!: QueryList<NavGroupComponent>;

  @ViewChild("contentContainer") contentContainer: ElementRef;

  private destroy$ = new Subject<void>();

  /**
   * Depth level for nested `nav-group`
   */
  protected nestDepth$ = new BehaviorSubject(1);

  /**
   * Is `true` if the expanded content is visible
   */
  protected open = false;

  /**
   * UID for `[attr.aria-controls]`
   */
  protected contentId = Math.random().toString(36).substring(2);

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.open = !this.open;
  }

  /**
   * - For any nested NavGroupComponents, increment the `nestDepth$` by 1.
   * - We can't use a simple margin for this because we want the element to fill the entire width of its container.
   */
  private initNestedStyles() {
    if (this.variant !== "tree") {
      return;
    }

    const nestedLeftPadding = 1.5; // rem
    this.nestDepth$.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      this.nestedNavGroups.forEach((navGroup) => {
        navGroup.nestDepth$.next(v + 1);
      });
      this.contentContainer.nativeElement.style.setProperty(
        "--nested-left-padding",
        `${v * nestedLeftPadding}rem`
      );
    });
  }

  ngAfterViewInit(): void {
    this.initNestedStyles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
