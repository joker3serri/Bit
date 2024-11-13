import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  ActiveUserState,
  StateProvider,
  UserKeyDefinition,
  NEW_DEVICE_VERIFICATION_NOTICE,
} from "@bitwarden/common/platform/state";

export type NewDeviceVerificationNotice = {
  last_dismissal: string;
  permanent_dismissal: boolean;
};

const NEW_DEVICE_VERIFICATION_NOTICE_KEY = new UserKeyDefinition<NewDeviceVerificationNotice>(
  NEW_DEVICE_VERIFICATION_NOTICE,
  "noticeState",
  {
    deserializer: (jsonData) => jsonData,
    clearOn: [],
  },
);

@Injectable()
export class NewDeviceVerificationNoticeService {
  private noticeState: ActiveUserState<NewDeviceVerificationNotice>;
  noticeState$: Observable<NewDeviceVerificationNotice>;

  constructor(private stateProvider: StateProvider) {
    this.noticeState = this.stateProvider.getActive(NEW_DEVICE_VERIFICATION_NOTICE_KEY);
    this.noticeState$ = this.noticeState.state$;
  }

  async updateNewDeviceVerificationNoticeState(
    newState: NewDeviceVerificationNotice,
  ): Promise<void> {
    await this.noticeState.update(() => {
      return { ...newState };
    });
  }
}
