import { Pipe, PipeTransform } from "@angular/core";

import { WebI18nService, WebTranslationKeys } from "./i18n.service";

@Pipe({
  name: "i18n",
})
export class WebI18nPipe implements PipeTransform {
  constructor(private i18nService: WebI18nService) {}

  transform(id: WebTranslationKeys, p1?: string, p2?: string, p3?: string): string {
    return this.i18nService.t(id, p1, p2, p3);
  }
}
