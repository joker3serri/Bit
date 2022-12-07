import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function domainNameValidator(errorMessage: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const forbiddenPatterns = [/^https:\/\//, /^http:\/\//, /^www\./];
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(control.value)) {
        return { invalidDomainName: errorMessage };
      }
    }
    return null;
  };
}
