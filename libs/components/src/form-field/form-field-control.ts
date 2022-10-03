export abstract class BitFormFieldControl {
  ariaDescribedBy: string;
  id: string;
  required: boolean;
  hasError: boolean;
  error: [string, any];
}
