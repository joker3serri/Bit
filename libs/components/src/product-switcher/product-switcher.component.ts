import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  combineLatest,
  filter,
  map,
  mergeWith,
  Observable,
  Subject,
  Subscription,
  takeUntil,
} from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

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
export class ProductSwitcherComponent implements OnDestroy {
  private _destroy$ = new Subject<void>();

  protected isOpen = false;

  @ViewChild(TemplateRef)
  private templateRef!: TemplateRef<any>;

  private overlayRef: OverlayRef;
  private defaultMenuConfig: OverlayConfig = {
    panelClass: "bit-menu-panel",
    hasBackdrop: true,
    backdropClass: "cdk-overlay-transparent-backdrop",
    scrollStrategy: this.overlay.scrollStrategies.reposition(),
    positionStrategy: this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: "start",
          originY: "bottom",
          overlayX: "start",
          overlayY: "top",
        },
        {
          originX: "end",
          originY: "bottom",
          overlayX: "end",
          overlayY: "top",
        },
      ])
      .withLockedPosition(true)
      .withFlexibleDimensions(false)
      .withPush(false),
  };
  private closedEventsSub: Subscription;

  protected products$ = combineLatest([
    this.organizationService.organizations$,
    this.route.paramMap,
  ]).pipe(
    map(([orgs, paramMap]) => {
      const routeOrg = orgs.find((o) => o.id === paramMap.get("organizationId"));
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
          // TODO update marketing link
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

  constructor(
    private organizationService: OrganizationService,
    private overlay: Overlay,
    private elementRef: ElementRef<HTMLElement>,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute
  ) {}

  protected toggleMenu() {
    this.isOpen ? this.destroyMenu() : this.openMenu();
  }

  private openMenu() {
    this.isOpen = true;
    this.overlayRef = this.overlay.create(this.defaultMenuConfig);

    const templatePortal = new TemplatePortal(this.templateRef, this.viewContainerRef);
    this.overlayRef.attach(templatePortal);

    this.closedEventsSub = this.getClosedEvents()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: KeyboardEvent | undefined) => {
        if (event?.key === "Tab") {
          // Required to ensure tab order resumes correctly
          this.elementRef.nativeElement.focus();
        }
        this.destroyMenu();
      });
  }

  ngOnDestroy() {
    this.disposeAll();
    this._destroy$.next();
    this._destroy$.complete();
  }

  private destroyMenu() {
    if (this.overlayRef == null || !this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.disposeAll();
  }

  private getClosedEvents(): Observable<any> {
    const detachments = this.overlayRef.detachments();
    const escKey = this.overlayRef
      .keydownEvents()
      .pipe(filter((event: KeyboardEvent) => event.key === "Escape"));
    const backdrop = this.overlayRef.backdropClick();
    return detachments.pipe(mergeWith(escKey, backdrop));
  }

  private disposeAll() {
    this.closedEventsSub?.unsubscribe();
    this.overlayRef?.dispose();
  }
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
