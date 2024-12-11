import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { firstValueFrom, map } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

import { NewDeviceVerificationNoticeService } from "../../../../vault/src/services/new-device-verification-notice.service";

export const NewDeviceVerificationNoticeGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const configService = inject(ConfigService);
  const newDeviceVerificationNoticeService = inject(NewDeviceVerificationNoticeService);
  const accountService = inject(AccountService);

  const tempNoticeFlag = await configService.getFeatureFlag(
    FeatureFlag.NewDeviceVerificationTemporaryDismiss,
  );
  const permNoticeFlag = await configService.getFeatureFlag(
    FeatureFlag.NewDeviceVerificationPermanentDismiss,
  );

  const currentAcctId = await firstValueFrom(
    accountService.activeAccount$.pipe(map((acct) => acct.id)),
  );
  const userItems$ = newDeviceVerificationNoticeService.noticeState$(currentAcctId);
  const userItems = await firstValueFrom(userItems$);

  if (
    userItems?.last_dismissal == null &&
    userItems?.permanent_dismissal == null &&
    (tempNoticeFlag || permNoticeFlag)
  ) {
    return router.createUrlTree(["/new-device-notice"]);
  }

  return true;
};
