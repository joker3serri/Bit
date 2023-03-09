import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { VaultItem } from "./vault-item";

export type VaultItemEvent =
  | {
      type: "attachements";
      item: CipherView;
    }
  | {
      type: "collections";
      item: CipherView;
    }
  | { type: "edit"; item: CollectionView }
  | { type: "access"; item: CollectionView }
  | { type: "clone"; item: CipherView }
  | { type: "events"; item: CipherView }
  | { type: "restore"; items: CipherView[] }
  | { type: "delete"; items: VaultItem[] }
  | { type: "copy"; item: CipherView; field: "username" | "password" | "totp" }
  | { type: "moveToFolder"; items: CipherView[] }
  | { type: "moveToOrganization"; items: CipherView[] };
