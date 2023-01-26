import { Observable } from "rxjs";

import { LocaleService } from "./locale.service";

export abstract class I18nService extends LocaleService {
  locale$: Observable<string>;
}
