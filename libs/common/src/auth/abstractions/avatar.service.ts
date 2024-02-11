import { Observable } from "rxjs";

// import { ProfileResponse } from "../models/response/profile.response";
import { UserId } from "../../types/guid";

export abstract class AvatarService {
  avatarColor$: Observable<string | null>;

  abstract setAvatarColor(color: string): Promise<void>;
  abstract getUserAvatarColor(userId: UserId): Promise<string | null>;

  // avatarUpdate$ = new Observable<string | null>();
  // abstract pushUpdate(color: string): Promise<ProfileResponse | void>;
  // abstract loadColorFromState(): Promise<string | null>;
}
