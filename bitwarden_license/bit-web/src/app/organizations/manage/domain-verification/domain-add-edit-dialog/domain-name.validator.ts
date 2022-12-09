import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function domainNameValidator(errorMessage: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Domain labels (sections) are only allowed to be 63 chars in length max
    // 1st and last chars cannot be hyphens per RFC 3696 (https://www.rfc-editor.org/rfc/rfc3696#section-2)

    // /^[a-zA-Z0-9]         # The domain name must start with a letter or a number
    // [a-zA-Z0-9-]{1,61}    # The domain name can have one to 61 characters that are letters, numbers, or hyphens
    // [a-zA-Z0-9]           # The domain name must end with a letter or a number
    // \.[a-zA-Z]{2,}$/      # The domain name must have a period followed by at least two letters (the domain extension)

    const domainNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    const invalid = !domainNameRegex.test(control.value);

    if (invalid) {
      return {
        invalidDomainName: {
          message: errorMessage,
        },
      };
    }

    return null;
  };
}
