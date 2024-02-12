import { Observable } from "rxjs";

import { UserId } from "../../types/guid";

export abstract class AvatarService {
  avatarColor$: Observable<string | null>;

  abstract setAvatarColor(color: string): Promise<void>;
  abstract getUserAvatarColor(userId: UserId): Promise<string | null>;
}
