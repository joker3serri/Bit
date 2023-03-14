import { ServiceUtils } from "@bitwarden/common/misc/serviceUtils";
import { NestingDelimiter } from "@bitwarden/common/models/domain/collection";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";

export function getNestedCollectionTree<C extends CollectionView>(collections: C[]): TreeNode<C>[] {
  const nodes: TreeNode<C>[] = [];
  collections.forEach((collection) => {
    const parts =
      collection.name != null
        ? collection.name.replace(/^\/+|\/+$/g, "").split(NestingDelimiter)
        : [];
    ServiceUtils.nestedTraverse(nodes, 0, parts, collection, null, NestingDelimiter);
  });
  return nodes;
}
