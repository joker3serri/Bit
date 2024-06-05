import { Component, Input, OnInit } from "@angular/core";

import {
  InvoiceResponse,
  InvoicesResponse,
} from "@bitwarden/common/billing/models/response/invoices.response";

@Component({
  selector: "app-invoices",
  templateUrl: "./invoices.component.html",
})
export class InvoicesComponent implements OnInit {
  @Input() startWith?: InvoicesResponse;
  @Input() getInvoices?: () => Promise<InvoicesResponse>;
  @Input() exportClientReport?: (invoiceNumber: string) => Promise<void>;

  protected invoices: InvoiceResponse[] = [];
  protected loading = true;

  runClientExport = async (invoiceNumber: string): Promise<void> =>
    await this.runClientExport(invoiceNumber);

  async ngOnInit(): Promise<void> {
    if (this.startWith) {
      this.invoices = this.startWith.invoices;
    } else if (this.getInvoices) {
      const response = await this.getInvoices();
      this.invoices = response.invoices;
    }
    this.loading = false;
  }
}
