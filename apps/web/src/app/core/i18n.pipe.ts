import { Pipe, PipeTransform } from "@angular/core";

import { WebI18nService, WebI18nKey } from "./i18n.service";

@Pipe({
  name: "i18n",
})
export class WebI18nPipe implements PipeTransform {
  constructor(private i18nService: WebI18nService) {}

  transform(
    id: WebI18nKey,
    p1?: string | number,
    p2?: string | number,
    p3?: string | number
  ): string {
    return this.i18nService.t(id, p1, p2, p3);
  }
}
