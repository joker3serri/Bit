import { NgIf } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  CardComponent,
  FormFieldModule,
  IconButtonModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-view-identity-sections",
  templateUrl: "./view-identity-sections.component.html",
  imports: [
    NgIf,
    JslibModule,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
    TypographyModule,
    FormFieldModule,
    IconButtonModule,
  ],
})
export class ViewIdentitySectionsComponent implements OnInit {
  @Input() cipher: CipherView;

  showPersonalDetails: boolean;
  showIdentificationDetails: boolean;
  showContactDetails: boolean;

  lastPersonalField: "company" | "username" | "fullName" | null = null;
  lastIdentificationField: "licenseNumber" | "passportNumber" | "ssn" | null = null;
  lastContactField: "address" | "phone" | "email" | null = null;

  ngOnInit(): void {
    this.showPersonalDetails = this.hasPersonalDetails();
    this.showIdentificationDetails = this.hasIdentificationDetails();
    this.showContactDetails = this.hasContactDetails();
    this.setLastFieldsInSections();
  }

  /** Returns all populated address fields */
  get addressFields(): string {
    const { address1, address2, address3, fullAddressPart2, country } = this.cipher.identity;
    return [address1, address2, address3, fullAddressPart2, country].filter(Boolean).join("\n");
  }

  /** Returns the number of "rows" that should be assigned to the address textarea */
  get addressRows(): number {
    return this.addressFields.split("\n").length;
  }

  /** Returns true when any of the "personal detail" attributes are populated */
  private hasPersonalDetails(): boolean {
    const { username, company, fullName } = this.cipher.identity;
    return Boolean(fullName || username || company);
  }

  /** Returns true when any of the "identification detail" attributes are populated */
  private hasIdentificationDetails(): boolean {
    const { ssn, passportNumber, licenseNumber } = this.cipher.identity;
    return Boolean(ssn || passportNumber || licenseNumber);
  }

  /** Returns true when any of the "contact detail" attributes are populated */
  private hasContactDetails(): boolean {
    const { email, phone } = this.cipher.identity;

    return Boolean(email || phone || this.addressFields);
  }

  /**
   * The last field populated in each section should not have bottom margin.
   * Checks each field in reverse order to determine which field is the last populated.
   */
  private setLastFieldsInSections(): void {
    const { fullName, username, company, ssn, passportNumber, licenseNumber, email, phone } =
      this.cipher.identity;

    // Personal details
    if (company) {
      this.lastPersonalField = "company";
    } else if (username) {
      this.lastPersonalField = "username";
    } else if (fullName) {
      this.lastPersonalField = "fullName";
    }

    // Identification details
    if (licenseNumber) {
      this.lastIdentificationField = "licenseNumber";
    } else if (passportNumber) {
      this.lastIdentificationField = "passportNumber";
    } else if (ssn) {
      this.lastIdentificationField = "ssn";
    }

    // Contact details
    if (this.addressFields) {
      this.lastContactField = "address";
    } else if (phone) {
      this.lastContactField = "phone";
    } else if (email) {
      this.lastContactField = "email";
    }
  }
}
