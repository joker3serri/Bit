import { map, Observable, of, switchMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { CollectionId, OrganizationId } from "@bitwarden/common/types/guid";

import { CollectionService } from "../abstractions/collection.service";

/**
 * Service for managing user cipher authorization.
 */
export abstract class CipherAuthorizationService {
  /**
   * Determines if the user can delete the specified cipher.
   *
   * @param {OrganizationId} organizationId - The organization id of the cipher.
   * @param {CollectionId[]} collectionIds - The collection ids related to the cipher.
   * @param {CollectionId} [activeCollectionId] - Optional. The selected collection id from the vault filter.
   *
   * @returns {Observable<boolean>} - An observable that emits a boolean value indicating if the user can delete the cipher.
   */
  canDeleteCipher$: (
    organizationId: OrganizationId,
    collectionIds: CollectionId[],
    activeCollectionId?: CollectionId,
  ) => Observable<boolean>;
}

/**
 * {@link CipherAuthorizationService}
 */
export class DefaultCipherAuthorizationService implements CipherAuthorizationService {
  constructor(
    private collectionService: CollectionService,
    private organizationService: OrganizationService,
  ) {}

  /**
   *
   * {@link CipherAuthorizationService.canDeleteCipher$}
   */
  canDeleteCipher$(
    organizationId: OrganizationId,
    collectionIds: CollectionId[],
    activeCollectionId?: CollectionId,
  ): Observable<boolean> {
    if (organizationId == null) {
      return of(true);
    }

    return this.organizationService.get$(organizationId).pipe(
      switchMap((organization) => {
        // If the user is an admin, they can delete an unassigned cipher
        if (collectionIds.length === 0) {
          return of(organization?.canEditUnmanagedCollections === true);
        }

        if (organization?.canEditAllCiphers) {
          return of(true);
        }

        return this.collectionService
          .decryptedCollectionViews$(collectionIds as CollectionId[])
          .pipe(
            map((allCollections) => {
              if (activeCollectionId) {
                const activeCollection = allCollections.find((c) => c.id === activeCollectionId);

                return activeCollection ? activeCollection.manage === true : false;
              }

              return allCollections.some((collection) => collection.manage);
            }),
          );
      }),
    );
  }
}
