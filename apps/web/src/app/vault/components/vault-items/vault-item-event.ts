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
  | { type: "restore"; item: VaultItem[] }
  | { type: "delete"; item: VaultItem[] }
  | { type: "copy"; item: CipherView; field: "username" | "password" | "totp" }
  | { type: "moveFolder"; items: CipherView[] }
  | { type: "moveToOrganization"; item: CipherView[] };
