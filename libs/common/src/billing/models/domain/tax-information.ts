import { TaxInfoResponse } from "@bitwarden/common/billing/models/response/tax-info.response";

export type TaxInformation = {
  country: string;
  postalCode: string;
  taxId: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
};

export const fromTaxInfoResponse = (response: TaxInfoResponse): TaxInformation => ({
  ...response,
});
