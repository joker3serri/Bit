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
  private avatarColorBehaviorSubject = new BehaviorSubject<string | null>(null);
  avatarColor$ = this.avatarColorBehaviorSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private stateProvider: StateProvider,
  ) {
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
}
