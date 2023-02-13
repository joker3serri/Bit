import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

@Injectable({
  providedIn: "root",
})
export class TrashApiService {
  constructor(private apiService: ApiService, private i18nService: I18nService) {}
}
