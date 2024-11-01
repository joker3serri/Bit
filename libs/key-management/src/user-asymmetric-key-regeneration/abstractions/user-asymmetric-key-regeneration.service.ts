import { UserId } from "@bitwarden/common/types/guid";

export abstract class UserAsymmetricKeysRegenerationService {
  /**
   * Handle regeneration of the user's asymmetric keys if they are invalid.
   */
  abstract handleUserAsymmetricKeysRegeneration: (userId: UserId) => Promise<void>;
}
