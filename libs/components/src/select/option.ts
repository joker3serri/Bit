import { TemplateRef } from "@angular/core";

export interface Option<T> {
  icon?: string;
  value: T | null;
  label?: string;
  content?: TemplateRef<unknown>;
}
