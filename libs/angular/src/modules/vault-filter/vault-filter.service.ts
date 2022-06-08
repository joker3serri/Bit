import { Injectable } from "@angular/core";

import { CipherService } from "@bitwarden/common/src/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/src/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/src/abstractions/folder.service";
import { OrganizationService } from "@bitwarden/common/src/abstractions/organization.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { PolicyType } from "@bitwarden/common/src/enums/policyType";
import { Organization } from "@bitwarden/common/src/models/domain/organization";
import { CollectionView } from "@bitwarden/common/src/models/view/collectionView";
import { FolderView } from "@bitwarden/common/src/models/view/folderView";

import { DynamicTreeNode } from "./models/dynamic-tree-node.model";

@Injectable()
export class VaultFilterService {
  constructor(
    protected stateService: StateService,
    protected organizationService: OrganizationService,
    protected folderService: FolderService,
    protected cipherService: CipherService,
    protected collectionService: CollectionService,
    protected policyService: PolicyService
  ) {}

  async storeCollapsedFilterNodes(collapsedFilterNodes: Set<string>): Promise<void> {
    await this.stateService.setCollapsedGroupings(Array.from(collapsedFilterNodes));
  }

  async buildCollapsedFilterNodes(): Promise<Set<string>> {
    return new Set(await this.stateService.getCollapsedGroupings());
  }

  async buildOrganizations(): Promise<Organization[]> {
    return await this.organizationService.getAll();
  }

  async buildFolders(organizationId?: string): Promise<DynamicTreeNode<FolderView>> {
    const storedFolders = await this.folderService.getAllDecrypted();
    let folders: FolderView[];
    if (organizationId != null) {
      const ciphers = await this.cipherService.getAllDecrypted();
      const orgCiphers = ciphers.filter((c) => c.organizationId == organizationId);
      folders = storedFolders.filter(
        (f) =>
          orgCiphers.filter((oc) => oc.folderId == f.id).length > 0 ||
          ciphers.filter((c) => c.folderId == f.id).length < 1
      );
    } else {
      folders = storedFolders;
    }
    const nestedFolders = await this.folderService.getAllNested(folders);
    return new DynamicTreeNode<FolderView>({
      fullList: folders,
      nestedList: nestedFolders,
    });
  }

  async buildCollections(organizationId?: string): Promise<DynamicTreeNode<CollectionView>> {
    const storedCollections = await this.collectionService.getAllDecrypted();
    let collections: CollectionView[];
    if (organizationId != null) {
      collections = storedCollections.filter((c) => c.organizationId === organizationId);
    } else {
      collections = storedCollections;
    }
    const nestedCollections = await this.collectionService.getAllNested(collections);
    return new DynamicTreeNode<CollectionView>({
      fullList: collections,
      nestedList: nestedCollections,
    });
  }

  async checkForSingleOrganizationPolicy(): Promise<boolean> {
    return await this.policyService.policyAppliesToUser(PolicyType.SingleOrg);
  }

  async checkForPersonalOwnershipPolicy(): Promise<boolean> {
    return await this.policyService.policyAppliesToUser(PolicyType.PersonalOwnership);
  }
}
