import { BehaviorSubject, firstValueFrom } from "rxjs";

import { ApiService } from "../../abstractions/api.service";
import { UpdateAvatarRequest } from "../../models/request/update-avatar.request";
import { AVATAR_DISK, KeyDefinition, StateProvider } from "../../platform/state";
import { UserId } from "../../types/guid";
import { AvatarService as AvatarServiceAbstraction } from "../abstractions/avatar.service";

const AVATAR_COLOR = new KeyDefinition<string>(AVATAR_DISK, "avatarColor", {
  deserializer: (value) => value,
});

export class AvatarService implements AvatarServiceAbstraction {
  // private _avatarUpdate$ = new BehaviorSubject<string | null>(null);
  // avatarUpdate$: Observable<string | null> = this._avatarUpdate$.asObservable();

  private avatarColorBehaviorSubject = new BehaviorSubject<string | null>(null);
  avatarColor$ = this.avatarColorBehaviorSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private stateProvider: StateProvider,
  ) {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    // this.loadColorFromState();
    this.avatarColor$ = this.stateProvider.getActive(AVATAR_COLOR).state$;
  }

  async setAvatarColor(color: string): Promise<void> {
    const { avatarColor } = await this.apiService.putAvatar(new UpdateAvatarRequest(color));

    await this.stateProvider.setUserState(AVATAR_COLOR, avatarColor);
    this.avatarColorBehaviorSubject.next(avatarColor);
  }

  async getUserAvatarColor(userId: UserId): Promise<string | null> {
    return firstValueFrom(this.stateProvider.getUserState$(AVATAR_COLOR, userId));
  }

  // loadColorFromState(): Promise<string | null> {
  //   return this.stateService.getAvatarColor().then((color) => {
  //     this._avatarUpdate$.next(color);
  //     return color;
  //   });
  // }

  // pushUpdate(color: string | null): Promise<ProfileResponse | void> {
  //   return this.apiService.putAvatar(new UpdateAvatarRequest(color)).then((response) => {
  //     // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
  //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
  //     this.stateService.setAvatarColor(response.avatarColor);
  //     this._avatarUpdate$.next(response.avatarColor);
  //   });
  // }
}
