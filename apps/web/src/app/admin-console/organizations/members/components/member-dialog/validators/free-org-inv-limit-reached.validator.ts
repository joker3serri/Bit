import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { ProductType } from "@bitwarden/common/enums";

@Injectable()
export class FreeOrgSeatLimitReachedValidator {
  constructor(private i18nService: I18nService) {}

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
