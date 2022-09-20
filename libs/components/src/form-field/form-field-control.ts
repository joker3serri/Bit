export abstract class BitFormFieldControl<T> {
  value: T;
  ariaDescribedBy: string;
  id: string;
  required: boolean;
  hasError: boolean;
  error: [string, any];
}
