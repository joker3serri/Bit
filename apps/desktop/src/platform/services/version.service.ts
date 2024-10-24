import { Injectable } from "@angular/core";
import { catchError, firstValueFrom, map } from "rxjs";

import { SdkService } from "@bitwarden/common/platform/abstractions/sdk/sdk.service";

@Injectable({
  providedIn: "root",
})
export class VersionService {
  constructor(private sdkService: SdkService) {}

  init() {
    ipc.platform.versions.registerSdkVersionProvider(async (resolve) => {
      const version = await firstValueFrom(
        this.sdkService.client$.pipe(
          map((c) => c.version()),
          catchError(() => "Unsupported"),
        ),
      );
      resolve(version);
    });
  }
}
