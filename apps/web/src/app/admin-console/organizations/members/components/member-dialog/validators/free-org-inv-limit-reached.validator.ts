import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { ProductType } from "@bitwarden/common/enums";

export function freeOrgSeatLimitReachedValidator(
  organization: Organization,
  allOrganizationUserEmails: string[]
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === "" || !control.value) {
      return null;
    }

    const newEmailsToAdd = control.value
      .split(",")
      .filter(
        (newEmailToAdd: string) =>
          !allOrganizationUserEmails.some((existingEmail) => existingEmail === newEmailToAdd)
      );

    const organizationIsOnFreePlan = organization.planProductType === ProductType.Free;
    const maxSeatsExceeded =
      allOrganizationUserEmails.length + newEmailsToAdd.length > organization.seats;

    return organizationIsOnFreePlan && maxSeatsExceeded
      ? {
          freePlanLimitReached: {
            seats: organization.seats,
          },
        }
      : null;
  };
}
