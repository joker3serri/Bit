import { Observable } from "rxjs";

import { CollectionId, OrganizationId, UserId } from "../../types/guid";
import { OrgKey } from "../../types/key";
import { CollectionData } from "../models/data/collection.data";
import { Collection } from "../models/domain/collection";
import { TreeNode } from "../models/domain/tree-node";
import { CollectionView } from "../models/view/collection.view";

export abstract class CollectionService {
  encryptedCollections$: Observable<Collection[]>;
  decryptedCollections$: Observable<CollectionView[]>;

  clearActiveUserCache: () => Promise<void>;
  encrypt: (model: CollectionView) => Promise<Collection>;
  /**
   * Emits the decrypted collections for the specified CollectionIds only
   */
  decryptedCollectionViews$: (ids: CollectionId[]) => Observable<CollectionView[]>;
  /**
   * @deprecated This method will soon be made private
   * See PM-12375
   */
  decryptMany: (
    collections: Collection[],
    orgKeys?: Record<OrganizationId, OrgKey>,
  ) => Promise<CollectionView[]>;
  getAllNested: (collections: CollectionView[]) => TreeNode<CollectionView>[];
  getNested: (collections: CollectionView[], id: string) => TreeNode<CollectionView>;
  upsert: (collection: CollectionData | CollectionData[]) => Promise<any>;
  replace: (collections: { [id: string]: CollectionData }, userId: UserId) => Promise<any>;
  clear: (userId?: string) => Promise<void>;
  delete: (id: string | string[]) => Promise<any>;
}
