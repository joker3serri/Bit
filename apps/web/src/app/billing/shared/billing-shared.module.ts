import { NgModule } from "@angular/core";

import { HeaderModule } from "../../layouts/header/header.module";
import { SharedModule } from "../../shared";

import { AddCreditDialogComponent } from "./add-credit-dialog.component";
import { AdjustPaymentDialogComponent } from "./adjust-payment-dialog.component";
import { AdjustStorageComponent } from "./adjust-storage.component";
import { BillingHistoryComponent } from "./billing-history.component";
import { OffboardingSurveyComponent } from "./offboarding-survey.component";
import { PaymentComponent } from "./payment/payment.component";
import { PaymentMethodComponent } from "./payment-method.component";
import { SecretsManagerSubscribeComponent } from "./sm-subscribe.component";
import { TaxInfoComponent } from "./tax-info.component";
import { UpdateLicenseDialogComponent } from "./update-license-dialog.component";
import { UpdateLicenseComponent } from "./update-license.component";

@NgModule({
  imports: [SharedModule, PaymentComponent, TaxInfoComponent, HeaderModule],
  declarations: [
    AddCreditDialogComponent,
    AdjustPaymentDialogComponent,
    AdjustStorageComponent,
    BillingHistoryComponent,
    PaymentMethodComponent,
    SecretsManagerSubscribeComponent,
    UpdateLicenseComponent,
    UpdateLicenseDialogComponent,
    OffboardingSurveyComponent,
  ],
  exports: [
    SharedModule,
    PaymentComponent,
    TaxInfoComponent,
    AdjustStorageComponent,
    BillingHistoryComponent,
    SecretsManagerSubscribeComponent,
    UpdateLicenseComponent,
    UpdateLicenseDialogComponent,
    OffboardingSurveyComponent,
  ],
})
export class BillingSharedModule {}
