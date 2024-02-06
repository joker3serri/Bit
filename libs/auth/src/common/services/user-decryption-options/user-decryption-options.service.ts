import { map } from "rxjs";

import { UserDecryptionOptions } from "@bitwarden/common/src/auth/models/domain/user-decryption-options/user-decryption-options";
import {
  ActiveUserState,
  KeyDefinition,
  StateProvider,
  USER_DECRYPTION_OPTIONS_DISK,
} from "@bitwarden/common/src/platform/state";
import { UserId } from "@bitwarden/common/src/types/guid";

import { InternalUserDecryptionOptionsServiceAbstraction } from "../../abstractions/user-decryption-options.service.abstraction";

export const USER_DECRYPTION_OPTIONS = new KeyDefinition<UserDecryptionOptions>(
  USER_DECRYPTION_OPTIONS_DISK,
  "decryptionOptions",
  {
    deserializer: (decryptionOptions) => UserDecryptionOptions.fromJSON(decryptionOptions),
  },
);

export class UserDecryptionOptionsService
  implements InternalUserDecryptionOptionsServiceAbstraction
{
  private userDecryptionOptionsState: ActiveUserState<UserDecryptionOptions>;

  userDecryptionOptions$;
  hasMasterPassword$;

  constructor(private stateProvider: StateProvider) {
    this.userDecryptionOptionsState = this.stateProvider.getActive(USER_DECRYPTION_OPTIONS);

    this.userDecryptionOptions$ = this.userDecryptionOptionsState.state$;
    this.hasMasterPassword$ = this.userDecryptionOptions$.pipe(
      map((options) => options?.hasMasterPassword ?? false),
    );
  }

  userDecryptionOptionsById$(userId: UserId) {
    return this.stateProvider.getUser(userId, USER_DECRYPTION_OPTIONS).state$;
  }

  async setUserDecryptionOptions(userDecryptionOptions: UserDecryptionOptions): Promise<void> {
    await this.userDecryptionOptionsState.update((_) => userDecryptionOptions);
  }
}
