import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";

import { TaxInformationComponent } from "@bitwarden/angular/billing/components";
import {
  fromTaxInfoResponse,
  TaxInformation,
} from "@bitwarden/common/billing/models/domain/tax-information";
import { TaxInfoResponse } from "@bitwarden/common/billing/models/response/tax-info.response";

@Component({
  selector: "app-provider-tax-information",
  templateUrl: "./provider-tax-information.component.html",
})
export class ProviderTaxInformationComponent implements OnInit {
  @Input({ required: true }) providerId: string;
  @Output() providerTaxInformationUpdated = new EventEmitter();
  @ViewChild(TaxInformationComponent) taxInformationComponent: TaxInformationComponent;

  protected taxInformation: TaxInformation;

  submit = async () => {};

  ngOnInit() {
    // TODO: Replace
    const taxInfoResponse = new TaxInfoResponse({
      Country: "US",
      PostalCode: "12345",
    });
    this.taxInformation = fromTaxInfoResponse(taxInfoResponse);
  }
}
