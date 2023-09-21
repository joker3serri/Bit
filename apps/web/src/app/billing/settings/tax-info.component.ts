import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationTaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/organization-tax-info-update.request";
import { TaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/tax-info-update.request";
import { TaxInfoResponse } from "@bitwarden/common/billing/models/response/tax-info.response";
import { TaxRateResponse } from "@bitwarden/common/billing/models/response/tax-rate.response";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

type TaxInfoView = Omit<TaxInfoResponse, "taxIdType"> & {
  includeTaxId: boolean;
  [key: string]: unknown;
};

class Country {
  constructor(
    public name: string,
    public isoCode: string,
    public taxEnabled: boolean,
    public disabled: boolean = false
  ) {}
}

@Component({
  selector: "app-tax-info",
  templateUrl: "tax-info.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class TaxInfoComponent {
  @Input() hideTaxDisabledCountries = false;
  @Input() trialFlow = false;
  @Output() onCountryChanged = new EventEmitter();

  loading = true;
  organizationId: string;
  taxInfo: TaxInfoView = {
    taxId: null,
    line1: null,
    line2: null,
    city: null,
    state: null,
    postalCode: null,
    country: "US",
    includeTaxId: false,
  };

  taxRates: TaxRateResponse[];

  countries: Country[];

  private pristine: TaxInfoView = {
    taxId: null,
    line1: null,
    line2: null,
    city: null,
    state: null,
    postalCode: null,
    country: "US",
    includeTaxId: false,
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      if (this.organizationId) {
        try {
          const taxInfo = await this.organizationApiService.getTaxInfo(this.organizationId);
          if (taxInfo) {
            this.taxInfo.taxId = taxInfo.taxId;
            this.taxInfo.state = taxInfo.state;
            this.taxInfo.line1 = taxInfo.line1;
            this.taxInfo.line2 = taxInfo.line2;
            this.taxInfo.city = taxInfo.city;
            this.taxInfo.state = taxInfo.state;
            this.taxInfo.postalCode = taxInfo.postalCode;
            this.taxInfo.country = taxInfo.country || "US";
            this.taxInfo.includeTaxId =
              this.taxInfo.country !== "US" &&
              (!!taxInfo.taxId ||
                !!taxInfo.line1 ||
                !!taxInfo.line2 ||
                !!taxInfo.city ||
                !!taxInfo.state);
          }
        } catch (e) {
          this.logService.error(e);
        }
      } else {
        try {
          const taxInfo = await this.apiService.getTaxInfo();
          if (taxInfo) {
            this.taxInfo.postalCode = taxInfo.postalCode;
            this.taxInfo.country = taxInfo.country || "US";
          }
        } catch (e) {
          this.logService.error(e);
        }
      }
      this.pristine = Object.assign({}, this.taxInfo);
      // If not the default (US) then trigger onCountryChanged
      if (this.taxInfo.country !== "US") {
        this.onCountryChanged.emit();
      }
      this.countries = this.getCountries();
    });

    try {
      const taxRates = await this.apiService.getTaxRates();
      if (taxRates) {
        this.taxRates = taxRates.data;
      }
    } catch (e) {
      this.logService.error(e);
    } finally {
      this.loading = false;
    }
  }

  get taxRate() {
    if (this.taxRates != null) {
      const localTaxRate = this.taxRates.find(
        (x) => x.country === this.taxInfo.country && x.postalCode === this.taxInfo.postalCode
      );
      return localTaxRate?.rate ?? null;
    }
  }

  getTaxInfoRequest(): TaxInfoUpdateRequest {
    if (this.organizationId) {
      const request = new OrganizationTaxInfoUpdateRequest();
      request.taxId = this.taxInfo.taxId;
      request.state = this.taxInfo.state;
      request.line1 = this.taxInfo.line1;
      request.line2 = this.taxInfo.line2;
      request.city = this.taxInfo.city;
      request.state = this.taxInfo.state;
      request.postalCode = this.taxInfo.postalCode;
      request.country = this.taxInfo.country;
      return request;
    } else {
      const request = new TaxInfoUpdateRequest();
      request.postalCode = this.taxInfo.postalCode;
      request.country = this.taxInfo.country;
      return request;
    }
  }

  submitTaxInfo(): Promise<any> {
    if (!this.hasChanged()) {
      return new Promise<void>((resolve) => {
        resolve();
      });
    }
    const request = this.getTaxInfoRequest();
    return this.organizationId
      ? this.organizationApiService.updateTaxInfo(
          this.organizationId,
          request as OrganizationTaxInfoUpdateRequest
        )
      : this.apiService.putTaxInfo(request);
  }

  changeCountry() {
    if (this.taxInfo.country === "US") {
      this.taxInfo.includeTaxId = false;
      this.taxInfo.taxId = null;
      this.taxInfo.line1 = null;
      this.taxInfo.line2 = null;
      this.taxInfo.city = null;
      this.taxInfo.state = null;
    }
    this.onCountryChanged.emit();
  }

  private hasChanged(): boolean {
    for (const key in this.taxInfo) {
      // eslint-disable-next-line
      if (this.pristine.hasOwnProperty(key) && this.pristine[key] !== this.taxInfo[key]) {
        return true;
      }
    }
    return false;
  }

  private allCountries: Country[] = [
    new Country("United States", "US", true),
    new Country("China", "CN", true),
    new Country("France", "FR", true),
    new Country("Germany", "DE", true),
    new Country("Canada", "CA", true),
    new Country("United Kingdom", "GB", true),
    new Country("Australia", "AU", true),
    new Country("India", "IN", true),
    new Country(null, "-", true, true),
    new Country("Afghanistan", "AF", false),
    new Country("Åland Islands", "AX", false),
    new Country("Albania", "AL", false),
    new Country("Algeria", "DZ", false),
    new Country("American Samoa", "AS", false),
    new Country("Andorra", "AD", true),
    new Country("Angola", "AO", false),
    new Country("Anguilla", "AI", false),
    new Country("Antarctica", "AQ", false),
    new Country("Antigua and Barbuda", "AG", false),
    new Country("Argentina", "AR", true),
    new Country("Armenia", "AM", false),
    new Country("Aruba", "AW", false),
    new Country("Austria", "AT", true),
    new Country("Azerbaijan", "AZ", false),
    new Country("Bahamas", "BS", false),
    new Country("Bahrain", "BH", false),
    new Country("Bangladesh", "BD", false),
    new Country("Barbados", "BB", false),
    new Country("Belarus", "BY", false),
    new Country("Belgium", "BE", true),
    new Country("Belize", "BZ", false),
    new Country("Benin", "BJ", false),
    new Country("Bermuda", "BM", false),
    new Country("Bhutan", "BT", false),
    new Country("Bolivia, Plurinational State of", "BO", true),
    new Country("Bonaire, Sint Eustatius and Saba", "BQ", false),
    new Country("Bosnia and Herzegovina", "BA", false),
    new Country("Botswana", "BW", false),
    new Country("Bouvet Island", "BV", false),
    new Country("Brazil", "BR", true),
    new Country("British Indian Ocean Territory", "IO", false),
    new Country("Brunei Darussalam", "BN", false),
    new Country("Bulgaria", "BG", true),
    new Country("Burkina Faso", "BF", false),
    new Country("Burundi", "BI", false),
    new Country("Cambodia", "KH", false),
    new Country("Cameroon", "CM", false),
    new Country("Cape Verde", "CV", false),
    new Country("Cayman Islands", "KY", false),
    new Country("Central African Republic", "CF", false),
    new Country("Chad", "TD", false),
    new Country("Chile", "CL", true),
    new Country("Christmas Island", "CX", false),
    new Country("Cocos (Keeling) Islands", "CC", false),
    new Country("Colombia", "CO", true),
    new Country("Comoros", "KM", false),
    new Country("Congo", "CG", false),
    new Country("Congo, the Democratic Republic of the", "CD", false),
    new Country("Cook Islands", "CK", false),
    new Country("Costa Rica", "CR", true),
    new Country("Côte d'Ivoire", "CI", false),
    new Country("Croatia", "HR", true),
    new Country("Cuba", "CU", false),
    new Country("Curaçao", "CW", false),
    new Country("Cyprus", "CY", true),
    new Country("Czech Republic", "CZ", true),
    new Country("Denmark", "DK", true),
    new Country("Djibouti", "DJ", false),
    new Country("Dominica", "DM", false),
    new Country("Dominican Republic", "DO", true),
    new Country("Ecuador", "EC", true),
    new Country("Egypt", "EG", true),
    new Country("El Salvador", "SV", true),
    new Country("Equatorial Guinea", "GQ", false),
    new Country("Eritrea", "ER", false),
    new Country("Estonia", "EE", true),
    new Country("Ethiopia", "ET", false),
    new Country("Falkland Islands (Malvinas)", "FK", false),
    new Country("Faroe Islands", "FO", false),
    new Country("Fiji", "FJ", false),
    new Country("Finland", "FI", true),
    new Country("French Guiana", "GF", false),
    new Country("French Polynesia", "PF", false),
    new Country("French Southern Territories", "TF", false),
    new Country("Gabon", "GA", false),
    new Country("Gambia", "GM", false),
    new Country("Georgia", "GE", true),
    new Country("Ghana", "GH", false),
    new Country("Gibraltar", "GI", false),
    new Country("Greece", "GR", true),
    new Country("Greenland", "GL", false),
    new Country("Grenada", "GD", false),
    new Country("Guadeloupe", "GP", false),
    new Country("Guam", "GU", false),
    new Country("Guatemala", "GT", false),
    new Country("Guernsey", "GG", false),
    new Country("Guinea", "GN", false),
    new Country("Guinea-Bissau", "GW", false),
    new Country("Guyana", "GY", false),
    new Country("Haiti", "HT", false),
    new Country("Heard Island and McDonald Islands", "HM", false),
    new Country("Holy See (Vatican City State)", "VA", false),
    new Country("Honduras", "HN", false),
    new Country("Hong Kong", "HK", true),
    new Country("Hungary", "HU", true),
    new Country("Iceland", "IS", true),
    new Country("Indonesia", "ID", true),
    new Country("Iran, Islamic Republic of", "IR", false),
    new Country("Iraq", "IQ", false),
    new Country("Ireland", "IE", true),
    new Country("Isle of Man", "IM", false),
    new Country("Israel", "IL", true),
    new Country("Italy", "IT", true),
    new Country("Jamaica", "JM", false),
    new Country("Japan", "JP", true),
    new Country("Jersey", "JE", false),
    new Country("Jordan", "JO", false),
    new Country("Kazakhstan", "KZ", false),
    new Country("Kenya", "KE", true),
    new Country("Kiribati", "KI", false),
    new Country("Korea, Democratic People's Republic of", "KP", false),
    new Country("Korea, Republic of", "KR", true),
    new Country("Kuwait", "KW", false),
    new Country("Kyrgyzstan", "KG", false),
    new Country("Lao People's Democratic Republic", "LA", false),
    new Country("Latvia", "LV", true),
    new Country("Lebanon", "LB", false),
    new Country("Lesotho", "LS", false),
    new Country("Liberia", "LR", false),
    new Country("Libya", "LY", false),
    new Country("Liechtenstein", "LI", true),
    new Country("Lithuania", "LT", true),
    new Country("Luxembourg", "LU", true),
    new Country("Macao", "MO", false),
    new Country("Macedonia, the former Yugoslav Republic of", "MK", false),
    new Country("Madagascar", "MG", false),
    new Country("Malawi", "MW", false),
    new Country("Malaysia", "MY", true),
    new Country("Maldives", "MV", false),
    new Country("Mali", "ML", false),
    new Country("Malta", "MT", true),
    new Country("Marshall Islands", "MH", false),
    new Country("Martinique", "MQ", false),
    new Country("Mauritania", "MR", false),
    new Country("Mauritius", "MU", false),
    new Country("Mayotte", "YT", false),
    new Country("Mexico", "MX", true),
    new Country("Micronesia, Federated States of", "FM", false),
    new Country("Moldova, Republic of", "MD", false),
    new Country("Monaco", "MC", false),
    new Country("Mongolia", "MN", false),
    new Country("Montenegro", "ME", false),
    new Country("Montserrat", "MS", false),
    new Country("Morocco", "MA", false),
    new Country("Mozambique", "MZ", false),
    new Country("Myanmar", "MM", false),
    new Country("Namibia", "NA", false),
    new Country("Nauru", "NR", false),
    new Country("Nepal", "NP", false),
    new Country("Netherlands", "NL", true),
    new Country("New Caledonia", "NC", false),
    new Country("New Zealand", "NZ", true),
    new Country("Nicaragua", "NI", false),
    new Country("Niger", "NE", false),
    new Country("Nigeria", "NG", false),
    new Country("Niue", "NU", false),
    new Country("Norfolk Island", "NF", false),
    new Country("Northern Mariana Islands", "MP", false),
    new Country("Norway", "NO", true),
    new Country("Oman", "OM", false),
    new Country("Pakistan", "PK", false),
    new Country("Palau", "PW", false),
    new Country("Palestinian Territory, Occupied", "PS", false),
    new Country("Panama", "PA", false),
    new Country("Papua New Guinea", "PG", false),
    new Country("Paraguay", "PY", false),
    new Country("Peru", "PE", true),
    new Country("Philippines", "PH", true),
    new Country("Pitcairn", "PN", false),
    new Country("Poland", "PL", true),
    new Country("Portugal", "PT", true),
    new Country("Puerto Rico", "PR", false),
    new Country("Qatar", "QA", false),
    new Country("Réunion", "RE", false),
    new Country("Romania", "RO", true),
    new Country("Russian Federation", "RU", true),
    new Country("Rwanda", "RW", false),
    new Country("Saint Barthélemy", "BL", false),
    new Country("Saint Helena, Ascension and Tristan da Cunha", "SH", false),
    new Country("Saint Kitts and Nevis", "KN", false),
    new Country("Saint Lucia", "LC", false),
    new Country("Saint Martin (French part)", "MF", false),
    new Country("Saint Pierre and Miquelon", "PM", false),
    new Country("Saint Vincent and the Grenadines", "VC", false),
    new Country("Samoa", "WS", false),
    new Country("San Marino", "SM", false),
    new Country("Sao Tome and Principe", "ST", false),
    new Country("Saudi Arabia", "SA", true),
    new Country("Senegal", "SN", false),
    new Country("Serbia", "RS", true),
    new Country("Seychelles", "SC", false),
    new Country("Sierra Leone", "SL", false),
    new Country("Singapore", "SG", true),
    new Country("Sint Maarten (Dutch part)", "SX", false),
    new Country("Slovakia", "SK", true),
    new Country("Slovenia", "SI", true),
    new Country("Solomon Islands", "SB", false),
    new Country("Somalia", "SO", false),
    new Country("South Africa", "ZA", true),
    new Country("South Georgia and the South Sandwich Islands", "GS", false),
    new Country("South Sudan", "SS", false),
    new Country("Spain", "ES", true),
    new Country("Sri Lanka", "LK", false),
    new Country("Sudan", "SD", false),
    new Country("Suriname", "SR", false),
    new Country("Svalbard and Jan Mayen", "SJ", false),
    new Country("Swaziland", "SZ", false),
    new Country("Sweden", "SE", true),
    new Country("Switzerland", "CH", true),
    new Country("Syrian Arab Republic", "SY", false),
    new Country("Taiwan", "TW", true),
    new Country("Tajikistan", "TJ", false),
    new Country("Tanzania, United Republic of", "TZ", false),
    new Country("Thailand", "TH", true),
    new Country("Timor-Leste", "TL", false),
    new Country("Togo", "TG", false),
    new Country("Tokelau", "TK", false),
    new Country("Tonga", "TO", false),
    new Country("Trinidad and Tobago", "TT", false),
    new Country("Tunisia", "TN", false),
    new Country("Turkey", "TR", true),
    new Country("Turkmenistan", "TM", false),
    new Country("Turks and Caicos Islands", "TC", false),
    new Country("Tuvalu", "TV", false),
    new Country("Uganda", "UG", false),
    new Country("Ukraine", "UA", true),
    new Country("United Arab Emirates", "AE", true),
    new Country("United States Minor Outlying Islands", "UM", false),
    new Country("Uruguay", "UY", true),
    new Country("Uzbekistan", "UZ", false),
    new Country("Vanuatu", "VU", false),
    new Country("Venezuela, Bolivarian Republic of", "VE", true),
    new Country("Viet Nam", "VN", true),
    new Country("Virgin Islands, British", "VG", false),
    new Country("Virgin Islands, U.S.", "VI", false),
    new Country("Wallis and Futuna", "WF", false),
    new Country("Western Sahara", "EH", false),
    new Country("Yemen", "YE", false),
    new Country("Zambia", "ZM", false),
    new Country("Zimbabwe", "ZW", false),
  ];

  getCountries(): Country[] {
    return this.hideTaxDisabledCountries
      ? this.allCountries.filter((country) => country.taxEnabled)
      : this.allCountries;
  }
}
