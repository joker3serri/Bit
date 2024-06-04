import { UserId } from "@bitwarden/common/types/guid";
import { UserKey } from "@bitwarden/common/types/key";

/**
 * Implemented by domains encrypted by the user key to support key rotations
 * @typeparam T A request model that contains re-encrypted data, must have an id property
 */
export interface UserKeyRotationDataProviderAbstraction<
  T extends { id: string } | { organizationId: string },
> {
  /**
   * Implemented by each domain to provide re-encrypted data for the user key rotation process
   * @param originalUserKey The original user key, useful for decrypting data
   * @param newUserKey The new user key to use for re-encryption
   * @param userId The owner of the data, useful for fetching data
   * @returns A list of data that has been re-encrypted with the new user key
   */
  getRotatedData(originalUserKey: UserKey, newUserKey: UserKey, userId: UserId): Promise<T[]>;
}
