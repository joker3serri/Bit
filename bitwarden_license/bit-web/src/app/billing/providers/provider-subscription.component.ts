import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, concatMap, takeUntil } from "rxjs";

// import { ApiService } from "@bitwarden/common/abstractions/api.service";
// import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { ProviderSubscriptionResponse } from "@bitwarden/common/billing/models/response/provider-subscription-response";
import { BillingSubscriptionItemResponse } from "@bitwarden/common/billing/models/response/subscription.response";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
// import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
// import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

@Component({
  selector: "app-provider-subscription",
  templateUrl: "./provider-subscription.component.html",
})
export class ProviderSubscriptionComponent {
  sub: ProviderSubscriptionResponse;
  lineItems: BillingSubscriptionItemResponse[] = [];
  providerId: string;
  firstLoaded = false;
  loading: boolean;
  locale: string;
  private destroy$ = new Subject<void>();
  showUpdatedSubscriptionStatusSection$: Observable<boolean>;
  userOrg: Organization;

  protected enableConsolidatedBilling$ = this.configService.getFeatureFlag$(
    FeatureFlag.EnableConsolidatedBilling,
  );

  constructor(
    private billingApiService: BillingApiServiceAbstraction,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    if (this.route.snapshot.queryParamMap.get("upgrade")) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
    }

    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.providerId = params.providerId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.showUpdatedSubscriptionStatusSection$ = this.configService.getFeatureFlag$(
      FeatureFlag.AC1795_UpdatedSubscriptionStatusSection,
    );
  }

  get subscriptionMarkedForCancel() {
    return false;
    // return (
    //   this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate
    // );
  }

  reinstate = async () => {
    if (this.loading) {
      return;
    }

    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "reinstateSubscription" },
      content: { key: "reinstateConfirmation" },
      type: "warning",
    });

    if (!confirmed) {
      return;
    }

    // try {
    //   await this.organizationApiService.reinstate(this.organizationId);
    //   this.platformUtilsService.showToast("success", null, this.i18nService.t("reinstated"));
    //   // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    //   // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //   this.load();
    // } catch (e) {
    //   this.logService.error(e);
    // }
  };

  get subscriptionLineItems() {
    return this.lineItems.map((lineItem: BillingSubscriptionItemResponse) => ({
      name: lineItem.name,
      amount: this.discountPrice(lineItem.amount, lineItem.productId),
      quantity: lineItem.quantity,
      interval: lineItem.interval,
      sponsoredSubscriptionItem: lineItem.sponsoredSubscriptionItem,
      addonSubscriptionItem: lineItem.addonSubscriptionItem,
      productName: lineItem.productName,
      productId: lineItem.productId,
    }));
  }

  discountPrice = (price: number, productId: string = null) => {
    // const discount =
    //   this.customerDiscount?.active &&
    //   (!productId ||
    //     !this.customerDiscount.appliesTo.length ||
    //     this.customerDiscount.appliesTo.includes(productId))
    //     ? price * (this.customerDiscount.percentOff / 100)
    //     : 0;

    // return price - discount;

    return 5;
  };

  get isExpired() {
    return false;
    // const nextInvoice = this.nextInvoice;

    // if (nextInvoice == null) {
    //   return false;
    // }

    // return new Date(nextInvoice.date).getTime() < Date.now();
  }

  get nextInvoice() {
    return "";
    //return this.sub != null ? this.sub.upcomingInvoice : null;
  }

  get customerDiscount() {
    // return this.sub != null ? this.sub.customerDiscount : null;
    return 5;
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.sub = await this.billingApiService.getProviderSubscription(this.providerId);

    this.loading = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
