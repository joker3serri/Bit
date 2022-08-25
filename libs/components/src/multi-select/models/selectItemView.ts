import { GroupResponse } from "@bitwarden/common/models/response/groupResponse";
import { OrganizationUserUserDetailsResponse } from "@bitwarden/common/models/response/organizationUserResponse";
import { ProviderUserUserDetailsResponse } from "@bitwarden/common/models/response/provider/providerUserResponse";
import { CollectionView } from "@bitwarden/common/models/view/collectionView";

export class SelectItemView {
  id: string = null; // Unique ID used for comparisons
  listName: string = null; // Default bindValue -> this is what will be displayed in list items
  labelName: string = null; // This is what will be displayed in the selection option badge
  icon: string = null; // Icon to display within the list
  parentGrouping: string = null; // Used to group items by parent
  data:
    | GroupResponse
    | CollectionView
    | ProviderUserUserDetailsResponse
    | OrganizationUserUserDetailsResponse;

  constructor(
    dataItem?:
      | GroupResponse
      | CollectionView
      | ProviderUserUserDetailsResponse
      | OrganizationUserUserDetailsResponse
  ) {
    if (dataItem == null) {
      return;
    }

    this.id = dataItem.id;
    this.listName = dataItem.name;
    this.labelName = this.listName;
    this.icon = "bw-user";
    this.data = dataItem;

    switch (dataItem.constructor) {
      case ProviderUserUserDetailsResponse:
      case OrganizationUserUserDetailsResponse: {
        const nameTuple = this.buildDisplayName(
          (dataItem as ProviderUserUserDetailsResponse) ||
            (dataItem as OrganizationUserUserDetailsResponse)
        );
        this.listName = nameTuple[0];
        this.labelName = nameTuple[1];
        break;
      }

      case GroupResponse:
        this.icon = "bwi-family";
        break;

      case CollectionView: {
        this.icon = "bwi-collection";
        const groupingTuple = this.buildParentGrouping(dataItem as CollectionView);
        this.listName = groupingTuple[0];
        this.labelName = this.listName;
        this.parentGrouping = groupingTuple[1] ?? null;
        break;
      }

      default:
        throw new Error(
          "SelectItemView -> Data Type not recognized: " + dataItem.constructor.toString
        );
    }
  }
  private buildDisplayName(
    item: ProviderUserUserDetailsResponse | OrganizationUserUserDetailsResponse
  ): [listName: string, labelName: string] {
    const name = item.name;
    const email = item.email;

    let listName: string;
    if (name != null && email != null) {
      listName = name + " (" + email + ")";
    } else {
      listName = name ?? email;
    }

    return [listName, name ?? email];
  }

  private buildParentGrouping(item: CollectionView): [name: string, parentGrouping: string] {
    const collectionBreakdown = item.name.split("/");
    const nameIndex = collectionBreakdown.length - 1;
    // Returns immediate parent of item for grouping
    const parentGroupIndex = collectionBreakdown.length - 2;

    if (collectionBreakdown.length > 1) {
      return [collectionBreakdown[nameIndex], collectionBreakdown[parentGroupIndex]];
    } else {
      return [collectionBreakdown[nameIndex], null];
    }
  }
}
