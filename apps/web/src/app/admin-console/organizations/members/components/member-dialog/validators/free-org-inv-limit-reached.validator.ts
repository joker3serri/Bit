import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { ProductType } from "@bitwarden/common/enums";

@Injectable()
export class FreeOrgSeatLimitReachedValidator {
  constructor(private i18nService: I18nService) {}

  /**
   * Checks if the limit of free organization seats has been reached when adding new users to an
   * organization
   * @param organization An object representing the organization to which new users are being added
   * @param allOrganizationUserEmails An array of strings containing all the existing email
   * addresses of users in the organization
   * @returns A function that takes an `AbstractControl` (a form control) and returns either
   * `ValidationErrors` or `null`.
   */
  validate(organization: Organization, allOrganizationUserEmails: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === "" || !control.value) {
        return null;
      }

      const newEmailsToAdd = control.value
        .split(",")
        .filter(
          (newEmailToAdd: string) =>
            newEmailToAdd &&
            !allOrganizationUserEmails.some((existingEmail) => existingEmail === newEmailToAdd)
        );

      const organizationIsOnFreePlan = organization.planProductType === ProductType.Free;
      const maxSeatsExceeded =
        allOrganizationUserEmails.length + newEmailsToAdd.length > organization.seats;

      return organizationIsOnFreePlan && maxSeatsExceeded
        ? {
            freePlanLimitReached: {
              message: this.i18nService.t("subscriptionFreePlan", organization.seats),
            },
          }
        : null;
    };
  }
}
