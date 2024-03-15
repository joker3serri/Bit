import { Observable } from "rxjs";

import { UserId } from "../../../types/guid";
import { GeneratedCredential, GeneratorCategory } from "../history";

/** Tracks the history of password generations.
 *  Each user gets their own store.
 */
export abstract class GeneratorHistoryService {
  /** Tracks a new credential. When an item with the same `credential` value
   *  is found, this method does nothing. When the total number of items exceeds
   *  {@link HistoryServiceOptions.maxTotal}, then the oldest items exceeding the total
   *  are deleted.
   *  @param userId identifies the user storing the credential.
   *  @param credential stored by the history service.
   *  @param date when the credential was generated. If this is omitted, then the generator
   *    uses the date the credential was added to the store instead.
   *  @returns a promise that completes with the added credential. If the credential
   *    wasn't added, then the promise completes with `null`.
   */
  track: (userId: UserId, credential: string, category: GeneratorCategory, date?: Date) => Promise<GeneratedCredential | null>;

  /** Removes a matching credential from the history service.
   *  @param userId identifies the user taking the credential.
   *  @param credential to match in the history service.
   *  @returns A promise that completes with the credential read. If the credential wasn't found,
   *    the promise completes with null.
   *  @remarks this can be used to extract an entry when a credential is stored in the vault.
   */
  take: (userId: UserId, credential: string) => Promise<GeneratedCredential | null>;

  /** Lists all credentials for a user.
   *  @param userId identifies the user listing the credential.
   *  @remarks This field is eventually consistent with `add`, `take`, and `clear` operations.
   *    It is not guaranteed to immediately reflect those changes.
   */
  credentials$: (userId: UserId) => Observable<GeneratedCredential[]>;
}
