import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { All, RoutedVaultFilterModel, Unassigned } from "./routed-vault-filter.model";

export type FilterFunction = (cipher: CipherView) => boolean;

export function createFilterFunction(filter: RoutedVaultFilterModel): FilterFunction {
  return (cipher) => {
    let cipherPassesFilter = true;
    if (filter.type === "favorites" && cipherPassesFilter) {
      cipherPassesFilter = cipher.favorite;
    }
    if (filter.type === "trash" && cipherPassesFilter) {
      cipherPassesFilter = cipher.isDeleted;
    }
    if (filter.type === "card" && cipherPassesFilter) {
      cipherPassesFilter = cipher.type === CipherType.Card;
    }
    if (filter.type === "identity" && cipherPassesFilter) {
      cipherPassesFilter = cipher.type === CipherType.Identity;
    }
    if (filter.type === "login" && cipherPassesFilter) {
      cipherPassesFilter = cipher.type === CipherType.Login;
    }
    if (filter.type === "note" && cipherPassesFilter) {
      cipherPassesFilter = cipher.type === CipherType.SecureNote;
    }
    // No folder
    if (filter.folderId === Unassigned && cipherPassesFilter) {
      cipherPassesFilter = cipher.folderId === null;
    }
    // Folder
    if (
      filter.folderId !== undefined &&
      filter.folderId !== All &&
      filter.folderId !== Unassigned &&
      cipherPassesFilter
    ) {
      cipherPassesFilter = cipher.folderId === filter.folderId;
    }
    // All collections (top level)
    if (filter.collectionId === All && cipherPassesFilter) {
      cipherPassesFilter = false;
    }
    // Unassigned
    if (filter.collectionId === Unassigned && cipherPassesFilter) {
      cipherPassesFilter =
        cipher.organizationId != null &&
        (cipher.collectionIds == null || cipher.collectionIds.length === 0);
    }
    // Collection
    if (
      filter.collectionId !== undefined &&
      filter.collectionId !== All &&
      filter.collectionId !== Unassigned &&
      cipherPassesFilter
    ) {
      cipherPassesFilter =
        cipher.collectionIds != null && cipher.collectionIds.includes(filter.collectionId);
    }
    // My Vault
    if (filter.organizationId === Unassigned && cipherPassesFilter) {
      cipherPassesFilter = cipher.organizationId === null;
    }
    // Organization
    else if (
      filter.organizationId !== undefined &&
      filter.organizationId !== Unassigned &&
      cipherPassesFilter
    ) {
      cipherPassesFilter = cipher.organizationId === filter.organizationId;
    }
    return cipherPassesFilter;
  };
}
