import { UserId } from "@bitwarden/common/types/guid";

export abstract class UserAsymmetricKeysRegenerationService {
  abstract shouldRegenerate: (userId: UserId) => Promise<boolean>;
  abstract regenerateUserAsymmetricKeys: (userId: UserId) => Promise<void>;
}
