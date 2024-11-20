import { map, skipWhile, switchMap, takeWhile } from "rxjs";

import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { KeyService } from "@bitwarden/key-management";

import {
  OrganizationBound,
  SingleOrganizationDependency,
  SingleUserDependency,
  UserBound,
} from "../dependencies";
import { errorOnChange } from "../rx";
import { PaddedDataPacker } from "../state/padded-data-packer";

import { LegacyEncryptorProvider } from "./legacy-encryptor-provider";
import { OrganizationEncryptor } from "./organization-encryptor.abstraction";
import { OrganizationKeyEncryptor } from "./organization-key-encryptor";
import { UserEncryptor } from "./user-encryptor.abstraction";
import { UserKeyEncryptor } from "./user-key-encryptor";

/** Creates encryptors
 */
export class KeyServiceLegacyEncryptorProvider implements LegacyEncryptorProvider {
  /** Instantiates the legacy encryptor provider.
   *  @param encryptService injected into encryptors to perform encryption
   *  @param keyService looks up keys for construction into an encryptor
   */
  constructor(
    private readonly encryptService: EncryptService,
    private readonly keyService: KeyService,
  ) {}

  userEncryptor$(frameSize: number, dependencies: SingleUserDependency) {
    const packer = new PaddedDataPacker(frameSize);
    const encryptor$ = dependencies.singleUserId$.pipe(
      errorOnChange(
        (userId) => userId,
        (expectedUserId, actualUserId) => ({ expectedUserId, actualUserId }),
      ),
      switchMap((userId) =>
        this.keyService.userKey$(userId).pipe(
          // wait until the key becomes available
          skipWhile((key) => !!key),
          // complete when the key becomes unavailable
          takeWhile((key) => !!key),
          map((key) => {
            const encryptor = new UserKeyEncryptor(userId, this.encryptService, key, packer);

            return { userId, encryptor } satisfies UserBound<"encryptor", UserEncryptor>;
          }),
        ),
      ),
    );

    return encryptor$;
  }

  organizationEncryptor$(frameSize: number, dependencies: SingleOrganizationDependency) {
    const packer = new PaddedDataPacker(frameSize);
    const encryptor$ = dependencies.singleOrganizationId$.pipe(
      errorOnChange(
        (pair) => pair.userId,
        (expectedUserId, actualUserId) => ({ expectedUserId, actualUserId }),
      ),
      errorOnChange(
        (pair) => pair.organizationId,
        (expectedOrganizationId, actualOrganizationId) => ({
          expectedOrganizationId,
          actualOrganizationId,
        }),
      ),
      switchMap((pair) =>
        this.keyService.orgKeys$(pair.userId).pipe(
          // wait until the key becomes available
          skipWhile((keys) => !!keys),
          // complete when the key becomes unavailable
          takeWhile((keys) => !!keys),
          map((keys) => {
            const organizationId = pair.organizationId;
            const key = keys[organizationId];
            const encryptor = new OrganizationKeyEncryptor(
              organizationId,
              this.encryptService,
              key,
              packer,
            );

            return { organizationId, encryptor } satisfies OrganizationBound<
              "encryptor",
              OrganizationEncryptor
            >;
          }),
        ),
      ),
    );

    return encryptor$;
  }
}
